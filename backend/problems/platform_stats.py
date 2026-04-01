import requests
import re
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}


def fetch_leetcode_stats(username):
    if not username:
        return None
    query = """
    query getUserProfile($username: String!) {
        matchedUser(username: $username) {
            profile {
                ranking
                reputation
                starRating
            }
            submitStats {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
        }
        userContestRanking(username: $username) {
            rating
            globalRanking
            totalParticipants
            topPercentage
        }
    }
    """
    try:
        res = requests.post(
            "https://leetcode.com/graphql",
            json={"query": query, "variables": {"username": username}},
            headers={**HEADERS, "Content-Type": "application/json", "Referer": "https://leetcode.com"},
            timeout=10
        )
        data = res.json().get("data", {})
        user = data.get("matchedUser")
        if not user:
            return {"error": "User not found"}

        submit = {s["difficulty"]: s["count"] for s in user["submitStats"]["acSubmissionNum"]}
        contest = data.get("userContestRanking") or {}

        return {
            "platform":        "leetcode",
            "username":        username,
            "ranking":         user["profile"].get("ranking"),
            "total_solved":    submit.get("All", 0),
            "easy_solved":     submit.get("Easy", 0),
            "medium_solved":   submit.get("Medium", 0),
            "hard_solved":     submit.get("Hard", 0),
            "contest_rating":  round(contest.get("rating", 0)),
            "contest_rank":    contest.get("globalRanking"),
            "top_percentage":  round(contest.get("topPercentage", 0), 1),
        }
    except Exception as e:
        return {"error": str(e)}


def fetch_gfg_stats(username):
    if not username:
        return None
    try:
        url = f"https://www.geeksforgeeks.org/user/{username}/"
        res = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(res.text, "lxml")

        # Overall solved count
        total_solved = 0
        easy_solved = medium_solved = hard_solved = 0
        institute_rank = None
        coding_score = None
        streak = None

        # Solved count from score cards
        score_cards = soup.find_all("div", class_=re.compile("scoreCard_head__", re.I))
        for card in score_cards:
            text = card.get_text(strip=True)
            parent = card.find_parent()
            value_div = parent.find("div", class_=re.compile("scoreCard_value__", re.I)) if parent else None
            value = value_div.get_text(strip=True) if value_div else "0"
            try:
                val = int(re.sub(r'\D', '', value))
            except ValueError:
                val = 0
            tl = text.lower()
            if "problem" in tl or "solved" in tl:
                total_solved = val
            elif "score" in tl or "coding" in tl:
                coding_score = val
            elif "streak" in tl:
                streak = val
            elif "institute" in tl or "rank" in tl:
                institute_rank = val

        # Try alternate selectors for problem counts
        if total_solved == 0:
            for el in soup.find_all(string=re.compile(r'\d+')):
                parent = el.find_parent()
                if parent:
                    label = parent.get_text(strip=True).lower()
                    if "problem" in label or "solved" in label:
                        m = re.search(r'\d+', str(el))
                        if m:
                            total_solved = int(m.group())
                            break

        # Difficulty breakdown
        for el in soup.find_all(["div", "span"], class_=re.compile("(easy|medium|hard|basic|school)", re.I)):
            text = el.get_text(strip=True).lower()
            m = re.search(r'\d+', text)
            val = int(m.group()) if m else 0
            cls_str = " ".join(el.get("class", [])).lower()
            if "easy" in cls_str:      easy_solved = val
            elif "medium" in cls_str:  medium_solved = val
            elif "hard" in cls_str:    hard_solved = val

        return {
            "platform":       "gfg",
            "username":       username,
            "total_solved":   total_solved,
            "easy_solved":    easy_solved,
            "medium_solved":  medium_solved,
            "hard_solved":    hard_solved,
            "institute_rank": institute_rank,
            "coding_score":   coding_score,
            "streak":         streak,
            "profile_url":    url,
        }
    except Exception as e:
        return {"error": str(e)}


def fetch_codeforces_stats(username):
    if not username:
        return None
    try:
        # User info
        res = requests.get(
            f"https://codeforces.com/api/user.info?handles={username}",
            timeout=10
        )
        data = res.json()
        if data.get("status") != "OK":
            return {"error": "User not found"}

        user = data["result"][0]

        # Solved problems count
        subs_res = requests.get(
            f"https://codeforces.com/api/user.status?handle={username}&from=1&count=10000",
            timeout=15
        )
        solved = set()
        subs_data = subs_res.json()
        if subs_data.get("status") == "OK":
            for sub in subs_data["result"]:
                if sub.get("verdict") == "OK":
                    p = sub.get("problem", {})
                    solved.add(f"{p.get('contestId')}-{p.get('index')}")

        # Contest history for rating chart
        rating_res = requests.get(
            f"https://codeforces.com/api/user.rating?handle={username}",
            timeout=10
        )
        contests = []
        if rating_res.json().get("status") == "OK":
            for c in rating_res.json()["result"][-10:]:  # last 10 contests
                contests.append({
                    "name":       c["contestName"],
                    "rating":     c["newRating"],
                    "rank":       c["rank"],
                })

        # Rank color mapping
        rating = user.get("rating", 0)
        max_rating = user.get("maxRating", 0)
        rank_color = (
            "#FF0000" if rating >= 2400 else
            "#FF8C00" if rating >= 2100 else
            "#AA00AA" if rating >= 1900 else
            "#0000FF" if rating >= 1600 else
            "#03A89E" if rating >= 1400 else
            "#008000" if rating >= 1200 else
            "#808080"
        )

        return {
            "platform":      "codeforces",
            "username":      username,
            "rating":        rating,
            "max_rating":    max_rating,
            "rank":          user.get("rank", "unrated"),
            "max_rank":      user.get("maxRank", "unrated"),
            "total_solved":  len(solved),
            "rank_color":    rank_color,
            "contests":      contests,
            "avatar":        user.get("titlePhoto", ""),
            "country":       user.get("country", ""),
        }
    except Exception as e:
        return {"error": str(e)}