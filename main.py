import json
from datetime import datetime
from pathlib import Path


# Папка для хранения данных
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

# Файл с результатами
DATA_FILE = DATA_DIR / "publications.json"

# Ключевые слова для поиска
KEYWORDS = [
    "python",
    "автоматизация",
    "разработчик",
]


# Тестовые публикации
TEST_PUBLICATIONS = [
    {
        "id": "1",
        "source": "telegram",
        "text": "Ищем Python-разработчика для автоматизации процессов",
    },
    {
        "id": "2",
        "source": "vk",
        "text": "Сегодня прекрасная погода",
    },
    {
        "id": "3",
        "source": "website",
        "text": "Нужен разработчик Python для нового проекта",
    },
]


def load_publications():
    """Загружает ранее сохранённые публикации."""

    if not DATA_FILE.exists():
        return []

    with DATA_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_publications(publications):
    """Сохраняет публикации в JSON-файл."""

    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(
            publications,
            file,
            ensure_ascii=False,
            indent=4,
        )


def contains_keywords(text):
    """Проверяет наличие ключевых слов в тексте."""

    text = text.casefold()

    return any(
        keyword.casefold() in text
        for keyword in KEYWORDS
    )


def main():
    print("=" * 45)
    print("       SOCIALPULSE CRM")
    print("=" * 45)

    saved_publications = load_publications()

    # Запоминаем идентификаторы уже сохранённых публикаций.
    existing_ids = {
        (item["source"], item["id"])
        for item in saved_publications
    }

    new_count = 0

    for publication in TEST_PUBLICATIONS:
        if not contains_keywords(publication["text"]):
            continue

        publication_key = (
            publication["source"],
            publication["id"],
        )

        if publication_key in existing_ids:
            continue

        publication["collected_at"] = (
            datetime.now().astimezone().isoformat()
        )

        saved_publications.append(publication)
        existing_ids.add(publication_key)
        new_count += 1

        print(f"\nНайдена публикация: {publication['text']}")

    save_publications(saved_publications)

    print("\n" + "=" * 45)
    print(f"Новых публикаций: {new_count}")
    print(f"Всего сохранено: {len(saved_publications)}")
    print(f"Файл с данными: {DATA_FILE}")
    print("=" * 45)


if __name__ == "__main__":
    main()