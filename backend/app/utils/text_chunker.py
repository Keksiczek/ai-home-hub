"""Text chunking utility for embeddings."""
from typing import List


def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> List[str]:
    """
    Split text into overlapping chunks.

    Args:
        text: Input text
        chunk_size: Target chunk size (characters)
        overlap: Overlap between chunks (characters)

    Returns:
        List of text chunks
    """
    if not text.strip():
        return []

    chunks = []
    words = text.split()
    current_chunk: List[str] = []
    current_length = 0

    for word in words:
        word_len = len(word) + 1  # +1 for space

        if current_length + word_len > chunk_size and current_chunk:
            # Save current chunk
            chunks.append(" ".join(current_chunk))

            # Start new chunk with overlap
            overlap_words: List[str] = []
            overlap_length = 0
            for w in reversed(current_chunk):
                if overlap_length + len(w) + 1 <= overlap:
                    overlap_words.insert(0, w)
                    overlap_length += len(w) + 1
                else:
                    break

            current_chunk = overlap_words
            current_length = overlap_length

        current_chunk.append(word)
        current_length += word_len

    # Add last chunk
    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks
