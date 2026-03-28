import re
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


def fetch_leetcode(url):
    match = re.search(r'/problems/([^/]+)', url)
    if not match:
        return None
    slug = match.group(1).rstrip('/')

    query = """
    query getQuestion($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
            title
            difficulty
            topicTags { name }
        }
    }
    """
    try:
        res = requests.post(
            "https://leetcode.com/graphql",
            json={"query": query, "variables": {"titleSlug": slug}},
            headers={**HEADERS, "Content-Type": "application/json", "Referer": "https://leetcode.com"},
            timeout=10
        )
        data = res.json().get("data", {}).get("question")
        if not data:
            return None
        return {
            "title":      data["title"],
            "difficulty": data["difficulty"].lower(),
            "topics":     [t["name"] for t in data.get("topicTags", [])],
            "platform":   "leetcode",
        }
    except Exception:
        return None


def fetch_gfg(url):
    try:
        # Strategy 1: derive title directly from the URL slug
        # e.g. geeksforgeeks.org/two-sum/ → "Two Sum"
        #      geeksforgeeks.org/problems/two-sum/1 → "Two Sum"
        slug_match = (
            re.search(r'/problems/([^/]+)', url) or
            re.search(r'geeksforgeeks\.org/([^/]+?)(?:/\d+)?/?$', url)
        )
        title = None
        if slug_match:
            slug = slug_match.group(1)
            # Convert kebab-case to Title Case, strip trailing numbers like /1
            slug = re.sub(r'-\d+$', '', slug)
            title = slug.replace('-', ' ').title()

        # Strategy 2: scrape the page for a better title
        res = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(res.text, "lxml")

        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            raw = og_title["content"]
            raw = re.sub(r'\s*[-|]\s*(GeeksforGeeks|Practice|GFG).*', '', raw, flags=re.I).strip()
            if raw.lower() not in ("geeksforgeeks", "geeks for geeks", ""):
                title = raw.title()   # force Title Case

        if not title or title.lower() in ("geeksforgeeks", "geeks for geeks"):
            page_title = soup.find("title")
            if page_title:
                raw = page_title.get_text(strip=True)
                raw = re.sub(r'\s*[-|]\s*(GeeksforGeeks|Practice|GFG).*', '', raw, flags=re.I).strip()
                if raw.lower() not in ("geeksforgeeks", "geeks for geeks", ""):
                    title = raw.title()   # force Title Case

        # Try h1 tags — skip ones that are just the site name
        if not title or title.lower() in ("geeksforgeeks", "geeks for geeks"):
            for tag in ["h1", "h2", "h3"]:
                found = soup.find(tag)
                if found:
                    text = found.get_text(strip=True)
                    if text.lower() not in ("geeksforgeeks", "geeks for geeks", ""):
                        title = text
                        break

        if not title:
            return None

        # Difficulty
        difficulty = "medium"
        for el in soup.find_all(["span", "div", "p"]):
            text = el.get_text(strip=True)
            if text in ("Easy", "Medium", "Hard", "School", "Basic"):
                w = text.lower()
                difficulty = {"school": "easy", "basic": "easy"}.get(w, w)
                break

        if difficulty == "medium":
            found = soup.find(string=re.compile(r'\b(Easy|Medium|Hard|School|Basic)\b', re.I))
            if found:
                m = re.search(r'\b(Easy|Medium|Hard|School|Basic)\b', str(found), re.I)
                if m:
                    w = m.group(1).lower()
                    difficulty = {"school": "easy", "basic": "easy"}.get(w, w)

        return {
            "title":      title,
            "difficulty": difficulty,
            "topics":     [],
            "platform":   "gfg",
        }
    except Exception:
        return None


def fetch_codeforces(url):
    match = (
        re.search(r'/contest/(\d+)/problem/([A-Z0-9]+)', url) or
        re.search(r'/problemset/problem/(\d+)/([A-Z0-9]+)', url)
    )
    if not match:
        return None

    contest_id, problem_id = match.group(1), match.group(2)
    try:
        page = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(page.text, "lxml")

        title_tag = soup.find("div", class_="title")
        title = title_tag.get_text(strip=True) if title_tag else f"Problem {problem_id}"
        title = re.sub(r'^[A-Z]\d*\.\s*', '', title)

        tags = []
        for tag in soup.find_all("span", class_="tag-box"):
            t = tag.get_text(strip=True)
            if not t.startswith('*'):   # skip rating tags like *1000
                tags.append(t)

        difficulty = "medium"
        rating_tag = soup.find("span", title="Difficulty")
        if rating_tag:
            rating_match = re.search(r'\d+', rating_tag.get_text(strip=True))
            if rating_match:
                rating = int(rating_match.group())
                if rating <= 1200:   difficulty = "easy"
                elif rating <= 2000: difficulty = "medium"
                else:                difficulty = "hard"
        # fallback: check *rating tag-box
        if difficulty == "medium":
            for tag in soup.find_all("span", class_="tag-box"):
                t = tag.get_text(strip=True)
                if t.startswith('*'):
                    try:
                        rating = int(t[1:])
                        if rating <= 1200:   difficulty = "easy"
                        elif rating <= 2000: difficulty = "medium"
                        else:                difficulty = "hard"
                    except ValueError:
                        pass
                    break

        return {
            "title":      title,
            "difficulty": difficulty,
            "topics":     tags,
            "platform":   "codeforces",
        }
    except Exception:
        return None


def fetch_problem_from_url(url: str):
    if "leetcode.com" in url:
        return fetch_leetcode(url)
    elif "geeksforgeeks.org" in url:
        return fetch_gfg(url)
    elif "codeforces.com" in url:
        return fetch_codeforces(url)
    return None