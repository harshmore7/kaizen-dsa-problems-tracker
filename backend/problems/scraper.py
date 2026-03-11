import re
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def fetch_leetcode(url):
    """Fetch problem details from LeetCode using their GraphQL API."""
    # Extract slug from URL like /problems/two-sum/
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
    """Scrape problem details from GeeksForGeeks."""
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(res.text, "lxml")

        # Title
        title_tag = (
            soup.find("h1", class_=re.compile("problem-title", re.I)) or
            soup.find("div", class_=re.compile("problem-title", re.I)) or
            soup.find("h3")
        )
        title = title_tag.get_text(strip=True) if title_tag else None

        # Difficulty
        difficulty = "medium"
        diff_tag = soup.find(string=re.compile(r'\b(Easy|Medium|Hard|School|Basic)\b', re.I))
        if diff_tag:
            found = re.search(r'\b(Easy|Medium|Hard)\b', str(diff_tag), re.I)
            if found:
                difficulty = found.group(1).lower()

        if not title:
            return None

        return {
            "title":      title,
            "difficulty": difficulty,
            "topics":     [],
            "platform":   "gfg",
        }
    except Exception:
        return None


def fetch_codeforces(url):
    """Fetch problem details from Codeforces."""
    # URL pattern: /contest/123/problem/A or /problemset/problem/123/A
    match = (
        re.search(r'/contest/(\d+)/problem/([A-Z0-9]+)', url) or
        re.search(r'/problemset/problem/(\d+)/([A-Z0-9]+)', url)
    )
    if not match:
        return None

    contest_id, problem_id = match.group(1), match.group(2)
    try:
        res = requests.get(
            f"https://codeforces.com/api/contest.standings?contestId={contest_id}&from=1&count=1",
            timeout=10
        )
        contest_name = res.json().get("result", {}).get("contest", {}).get("name", "")

        # Scrape the problem page for title and tags
        page = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(page.text, "lxml")

        title_tag = soup.find("div", class_="title")
        title = title_tag.get_text(strip=True) if title_tag else f"Problem {problem_id}"
        # Remove leading "A. " etc
        title = re.sub(r'^[A-Z]\d*\.\s*', '', title)

        tags = []
        for tag in soup.find_all("span", class_="tag-box"):
            tags.append(tag.get_text(strip=True))

        # CF doesn't have easy/medium/hard — use rating to infer
        difficulty = "medium"
        rating_tag = soup.find("span", title="Difficulty")
        if rating_tag:
            rating_text = rating_tag.get_text(strip=True)
            rating_match = re.search(r'\d+', rating_text)
            if rating_match:
                rating = int(rating_match.group())
                if rating <= 1200:   difficulty = "easy"
                elif rating <= 2000: difficulty = "medium"
                else:                difficulty = "hard"

        return {
            "title":      title,
            "difficulty": difficulty,
            "topics":     tags,
            "platform":   "codeforces",
        }
    except Exception:
        return None


def fetch_problem_from_url(url: str):
    """Route to the correct fetcher based on URL domain."""
    if "leetcode.com" in url:
        return fetch_leetcode(url)
    elif "geeksforgeeks.org" in url:
        return fetch_gfg(url)
    elif "codeforces.com" in url:
        return fetch_codeforces(url)
    return None