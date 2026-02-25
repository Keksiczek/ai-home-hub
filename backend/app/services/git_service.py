"""Git service – run git operations via subprocess."""
import asyncio
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class GitService:
    """Wrapper around the git CLI for common repository operations."""

    async def _run(self, *args: str, cwd: Optional[str] = None) -> str:
        """Run a git command and return stdout, raising on non-zero exit."""
        proc = await asyncio.create_subprocess_exec(
            "git", *args,
            cwd=cwd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=60.0)
        if proc.returncode != 0:
            raise RuntimeError(stderr.decode().strip() or f"git {args[0]} failed")
        return stdout.decode().strip()

    # ── Read operations ────────────────────────────────────────

    async def status(self, repo_path: str) -> Dict[str, Any]:
        """Return current git status as structured data."""
        output = await self._run("status", "--porcelain=v1", cwd=repo_path)
        branch = await self._run("rev-parse", "--abbrev-ref", "HEAD", cwd=repo_path)
        changes: List[Dict[str, str]] = []
        for line in output.splitlines():
            if len(line) >= 3:
                xy = line[:2]
                filepath = line[3:]
                changes.append({"status": xy, "file": filepath})
        return {"branch": branch, "changes": changes, "clean": len(changes) == 0}

    async def log(self, repo_path: str, count: int = 10) -> List[Dict[str, str]]:
        """Return recent commit log entries."""
        fmt = "%H\x1f%s\x1f%an\x1f%ar"
        output = await self._run(
            "log", f"-{count}", f"--format={fmt}", cwd=repo_path
        )
        commits = []
        for line in output.splitlines():
            parts = line.split("\x1f")
            if len(parts) == 4:
                commits.append(
                    {
                        "hash": parts[0][:8],
                        "subject": parts[1],
                        "author": parts[2],
                        "when": parts[3],
                    }
                )
        return commits

    async def diff(self, repo_path: str, staged: bool = False) -> str:
        """Return git diff output."""
        args = ["diff", "--stat"]
        if staged:
            args.append("--cached")
        return await self._run(*args, cwd=repo_path)

    async def current_branch(self, repo_path: str) -> str:
        """Return the current branch name."""
        return await self._run("rev-parse", "--abbrev-ref", "HEAD", cwd=repo_path)

    async def list_branches(self, repo_path: str) -> List[str]:
        """Return list of local branches."""
        output = await self._run("branch", "--format=%(refname:short)", cwd=repo_path)
        return [b.strip() for b in output.splitlines() if b.strip()]

    async def detect_conflicts(self, repo_path: str) -> List[str]:
        """Return list of files with merge conflicts."""
        output = await self._run("diff", "--name-only", "--diff-filter=U", cwd=repo_path)
        return [f.strip() for f in output.splitlines() if f.strip()]

    # ── Write operations ───────────────────────────────────────

    async def add_all(self, repo_path: str) -> str:
        """Stage all changes."""
        return await self._run("add", "-A", cwd=repo_path)

    async def commit(self, repo_path: str, message: str) -> str:
        """Commit staged changes."""
        output = await self._run("commit", "-m", message, cwd=repo_path)
        return output

    async def commit_all(self, repo_path: str, message: str) -> str:
        """Stage all changes and commit."""
        await self.add_all(repo_path)
        return await self.commit(repo_path, message)

    async def push(self, repo_path: str, branch: Optional[str] = None) -> str:
        """Push to remote origin."""
        args = ["push"]
        if branch:
            args += ["origin", branch]
        return await self._run(*args, cwd=repo_path)

    async def pull(self, repo_path: str, branch: Optional[str] = None) -> str:
        """Pull from remote origin."""
        args = ["pull"]
        if branch:
            args += ["origin", branch]
        return await self._run(*args, cwd=repo_path)

    async def create_branch(self, repo_path: str, branch_name: str) -> str:
        """Create and checkout a new branch."""
        return await self._run("checkout", "-b", branch_name, cwd=repo_path)

    async def checkout(self, repo_path: str, branch_name: str) -> str:
        """Checkout an existing branch."""
        return await self._run("checkout", branch_name, cwd=repo_path)

    async def fetch(self, repo_path: str) -> str:
        """Fetch from all remotes."""
        return await self._run("fetch", "--all", cwd=repo_path)

    async def stash(self, repo_path: str) -> str:
        """Stash uncommitted changes."""
        return await self._run("stash", cwd=repo_path)

    async def stash_pop(self, repo_path: str) -> str:
        """Pop the most recent stash."""
        return await self._run("stash", "pop", cwd=repo_path)

    # ── Generic action dispatcher ──────────────────────────────

    async def run_action(self, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        repo_path = params.get("repo_path", ".")
        try:
            if action == "status":
                data = await self.status(repo_path)
                return {"status": "ok", "data": data}
            elif action == "log":
                commits = await self.log(repo_path, int(params.get("count", 10)))
                return {"status": "ok", "data": {"commits": commits}}
            elif action == "diff":
                diff = await self.diff(repo_path, params.get("staged", False))
                return {"status": "ok", "data": {"diff": diff}}
            elif action == "commit":
                result = await self.commit_all(repo_path, params["message"])
                return {"status": "ok", "detail": result}
            elif action == "push":
                result = await self.push(repo_path, params.get("branch"))
                return {"status": "ok", "detail": result}
            elif action == "pull":
                result = await self.pull(repo_path, params.get("branch"))
                return {"status": "ok", "detail": result}
            elif action == "create_branch":
                result = await self.create_branch(repo_path, params["branch"])
                return {"status": "ok", "detail": result}
            elif action == "checkout":
                result = await self.checkout(repo_path, params["branch"])
                return {"status": "ok", "detail": result}
            elif action == "fetch":
                result = await self.fetch(repo_path)
                return {"status": "ok", "detail": result}
            elif action == "stash":
                result = await self.stash(repo_path)
                return {"status": "ok", "detail": result}
            elif action == "stash_pop":
                result = await self.stash_pop(repo_path)
                return {"status": "ok", "detail": result}
            elif action == "branches":
                branches = await self.list_branches(repo_path)
                return {"status": "ok", "data": {"branches": branches}}
            elif action == "conflicts":
                conflicts = await self.detect_conflicts(repo_path)
                return {"status": "ok", "data": {"conflicts": conflicts}}
            else:
                return {"status": "error", "detail": f"Unknown action: {action}"}
        except asyncio.TimeoutError:
            return {"status": "error", "detail": "Git operation timed out"}
        except RuntimeError as exc:
            return {"status": "error", "detail": str(exc)}
        except KeyError as exc:
            return {"status": "error", "detail": f"Missing required param: {exc}"}
        except FileNotFoundError:
            return {"status": "error", "detail": "git CLI not found"}


_git_service: Optional[GitService] = None


def get_git_service() -> GitService:
    global _git_service
    if _git_service is None:
        _git_service = GitService()
    return _git_service
