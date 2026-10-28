import asyncio
import json
import os

from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from telethon import TelegramClient


# Загружаем настройки из .env
load_dotenv()

API_ID = int(os.environ["TELEGRAM_API_ID"])
API_HASH = os.environ["TELEGRAM_API_HASH"]

# Источники для мониторинга.
# Для первого теста укажи публичный канал,
# доступный твоему аккаунту.
CHANNEL = "durov"

# Ключевые слова для поиска
KEYWORDS = [
    "python",
    "разработчик",
    "разработка",
    "программист",
    "программирование",
    "автоматизация",
    "автоматизировать",
    "бот",
    "telegram bot",
    "телеграм-бот",
    "ищу специалиста",
    "ищу разработчика",
    "нужен разработчик",
    "нужен программист",
    "заказать разработку",
    "парсер",
    "веб-скрапинг",
    "сбор данных",
    "api",
]

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

DATA_FILE = DATA_DIR / "publications.json"


def load_publications():
    """Загружает ранее сохранённые публикации."""

    if not DATA_FILE.exists():
        return []

    with DATA_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_publications(publications):
    """Сохраняет публикации в JSON."""

    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(
            publications,
            file,
            ensure_ascii=False,
            indent=4,
        )


def contains_keywords(text):
    """Проверяет наличие ключевых слов."""

    text = text.casefold()

    return any(
        keyword.casefold() in text
        for keyword in KEYWORDS
    )

def is_potential_lead(text):
    """Проверяет, похожа ли публикация на поиск исполнителя."""

    text = text.casefold()

    lead_phrases = [
        "ищу разработчика",
        "ищем разработчика",
        "нужен разработчик",
        "нужен программист",
        "ищу программиста",
        "ищем программиста",
        "ищу специалиста",
        "ищем специалиста",
        "заказать разработку",
        "нужен бот",
        "заказать бота",
        "ищу исполнителя",
        "требуется разработчик",
        "требуется программист",
    ]

    return any(phrase in text for phrase in lead_phrases)
    
async def collect_telegram():
    """Получает последние сообщения из Telegram."""
    client = TelegramClient(
        "socialpulse_session",
        API_ID,
        API_HASH,
    )

    try:
        await client.start()

        print(f"Подключение к Telegram успешно.")
        print(f"Источник: {CHANNEL}")

        saved = load_publications()

        existing_ids = {
            (item["source"], str(item["id"]))
            for item in saved
        }

        new_count = 0

        # Читаем последние 100 сообщений.
        async for message in client.iter_messages(
            CHANNEL,
            limit=100,
        ):
            if not message.message:
                continue

            if not contains_keywords(message.message):
                continue

            if not is_potential_lead(message.message):
                continue

            print("Найден потенциальный заказ:", message.message[:100].replace("\n", " "))
            message_id = str(message.id)

            if key in existing_ids:
                continue

            publication = {
                "id": message_id,
                "source": "telegram",
                "channel": CHANNEL,
                "text": message.message,
                "url": (
                    f"https://t.me/{CHANNEL}/{message.id}"
                ),
                "published_at": (
                    message.date.isoformat()
                    if message.date
                    else None
                ),
                "collected_at": (
                    datetime.now().astimezone().isoformat()
                ),
            }

            saved.append(publication)
            existing_ids.add(key)
            new_count += 1

            print(
                f"\nНайдена публикация #{message.id}:"
            )
            print(message.message[:200])

        save_publications(saved)

        print("\nСбор завершён.")
        print(f"Новых публикаций: {new_count}")
        print(f"Всего сохранено: {len(saved)}")

    finally:
        await client.disconnect()


if __name__ == "__main__":
    asyncio.run(collect_telegram())