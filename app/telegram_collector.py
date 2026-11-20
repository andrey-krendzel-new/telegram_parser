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
CHANNELS = ["durov", "telegram"]

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

def save_to_supabase(publications):
    """Отправляет новые публикации в Supabase без дубликатов."""

    from urllib.request import Request, urlopen
    from urllib.parse import urlencode

    if not publications:
        print("Новых записей для Supabase нет.")
        return

    supabase_url = os.environ["SUPABASE_URL"].rstrip("/")
    supabase_key = os.environ["SUPABASE_KEY"]

    query = urlencode({
        "select": "id",
        "source": "eq.telegram",
    })

    request = Request(
        f"{supabase_url}/rest/v1/leads?{query}",
        headers={"apikey": supabase_key},
    )

    with urlopen(request, timeout=30) as response:
        existing = json.loads(response.read().decode("utf-8"))

    existing_ids = {item["id"] for item in existing}
    rows = []

    for publication in publications:
        message_id = str(publication["id"])
        channel = publication.get("channel", "durov")
        supabase_id = f"telegram:{channel}:{message_id}"

        if supabase_id in existing_ids:
            continue

        rows.append({
            "id": supabase_id,
            "source": "telegram",
            "channel": publication.get("channel", ""),
            "text": publication["text"],
            "collected_at": publication["collected_at"],
            "status": "Новая",
            "author_name": publication.get("author_name", ""),
            "author_username": publication.get("author_username", ""),
            "author_url": publication.get("author_url", ""),
        })

    if not rows:
        print("Новых записей для Supabase нет.")
        return

    request = Request(
        f"{supabase_url}/rest/v1/leads",
        data=json.dumps(rows, ensure_ascii=False).encode("utf-8"),
        headers={
            "apikey": supabase_key,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        method="POST",
    )

    with urlopen(request, timeout=30) as response:
        print("Supabase: HTTP", response.status)

    print(f"Отправлено в Supabase: {len(rows)}")

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

def score_lead(text):
    text = text.casefold()
    score = 0

    strong_phrases = [
    "ищу разработчика",
    "ищем разработчика",
    "нужен разработчик",
    "ищу программиста",
    "нужен программист",
    "ищу исполнителя",
    "заказать разработку",
]

    technical_words = [
    "python",
    "бот",
    "автоматизация",
    "парсер",
    "api",
]

    if any(phrase in text for phrase in strong_phrases):
        score += 2

    if any(word in text for word in technical_words):
        score += 1

    return score

    
async def collect_telegram():
    """Получает последние сообщения из нескольких Telegram-каналов."""

    client = TelegramClient(
        "socialpulse_session",
        API_ID,
        API_HASH,
    )

    try:
        await client.start()
        print("Подключение к Telegram успешно.")

        saved = load_publications()

        existing_ids = {
            (
                item["source"],
                item.get("channel", "durov"),
                str(item["id"]),
            )
            for item in saved
        }

        new_count = 0
        new_publications = []

        for channel in CHANNELS:
            channel = channel.lstrip("@")
            print(f"\\nСканируем канал: {channel}")

            try:
                async for message in client.iter_messages(
                    channel,
                    limit=100,
                ):
                    if not message.message:
                        continue

                    if not contains_keywords(message.message):
                        continue

                    if not is_potential_lead(message.message):
                        continue

                    message_id = str(message.id)
                    key = ("telegram", channel, message_id)

                    if key in existing_ids:
                        continue

                    print(
                        "Найден потенциальный заказ:",
                        message.message[:100].replace("\\n", " ")
                    )

                    sender = await message.get_sender()

                    author_name = ""
                    author_username = ""
                    author_url = ""

                    if sender:
                        first_name = getattr(sender, "first_name", "") or ""
                        last_name = getattr(sender, "last_name", "") or ""
                        sender_title = getattr(sender, "title", "") or ""

                        author_name = (
                            getattr(message, "post_author", None)
                            or f"{first_name} {last_name}".strip()
                            or sender_title
                        )

                        author_username = getattr(sender, "username", "") or ""

                        if author_username:
                            author_url = f"https://t.me/{author_username}"

                    publication = {
                        "author_name": author_name,
                        "author_username": author_username,
                        "author_url": author_url,
                        "id": message_id,
                        "source": "telegram",
                        "channel": channel,
                        "text": message.message,
                        "url": f"https://t.me/{channel}/{message.id}",
                        "published_at": (
                            message.date.isoformat()
                            if message.date
                            else None
                        ),
                        "collected_at": datetime.now().astimezone().isoformat(),
                        "status": "new",
                        "lead_score": score_lead(message.message),
                    }

                    saved.append(publication)
                    new_publications.append(publication)
                    existing_ids.add(key)
                    new_count += 1

                    print(f"Найдена публикация #{message.id}:")
                    print(message.message[:200])

            except Exception as error:
                print(f"Ошибка при сканировании {channel}: {error}")

        save_publications(saved)

        try:
            save_to_supabase(new_publications)
        except Exception as error:
            print(f"Ошибка отправки в Supabase: {error}")

        print("\\nСбор завершён.")
        print(f"Новых публикаций: {new_count}")
        print(f"Всего сохранено: {len(saved)}")

    finally:
        await client.disconnect()


if __name__ == "__main__":
    asyncio.run(collect_telegram())