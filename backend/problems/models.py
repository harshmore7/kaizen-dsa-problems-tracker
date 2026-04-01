from django.db import models

class Topic(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Problem(models.Model):
    PLATFORM_CHOICES = [
        ('leetcode', 'LeetCode'),
        ('gfg', 'GeeksForGeeks'),
        ('codeforces', 'Codeforces'),
        ('codechef', 'CodeChef'),
        ('hackerrank', 'HackerRank'),
        ('other', 'Other'),
    ]
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    STATUS_CHOICES = [
        ('unsolved', 'Unsolved'),
        ('solved', 'Solved'),
        ('revision', 'Needs Revision'),
    ]

    title       = models.CharField(max_length=255)
    link        = models.URLField(blank=True)
    platform    = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='leetcode')
    difficulty  = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unsolved')
    topics = models.ManyToManyField(Topic, blank=True, related_name='problems')
    notes       = models.TextField(blank=True)
    date_added  = models.DateField(auto_now_add=True)
    # Spaced repetition fields
    ease_factor      = models.FloatField(default=2.5)
    interval         = models.IntegerField(default=1)
    repetitions      = models.IntegerField(default=0)
    next_review_date = models.DateField(null=True, blank=True)
    last_reviewed    = models.DateField(null=True, blank=True)
    time_spent_mins = models.IntegerField(default=0)  # total minutes spent

    def __str__(self):
        return self.title


class Solution(models.Model):
    problem          = models.OneToOneField(Problem, on_delete=models.CASCADE, related_name='solution')
    brute_force      = models.TextField(blank=True)
    optimized        = models.TextField(blank=True)
    time_complexity  = models.CharField(max_length=50, blank=True)
    space_complexity = models.CharField(max_length=50, blank=True)
    code             = models.TextField(blank=True)
    language         = models.CharField(max_length=30, default='python')

    def __str__(self):
        return f"Solution for {self.problem.title}"


class Revision(models.Model):
    problem    = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='revisions')
    revised_on = models.DateField(auto_now_add=True)
    note       = models.TextField(blank=True)

    def __str__(self):
        return f"Revision of {self.problem.title} on {self.revised_on}"


class UserStats(models.Model):
    xp            = models.IntegerField(default=0)
    level         = models.IntegerField(default=1)
    streak        = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_solved_date = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'User Stats'

    def __str__(self):
        return f"Level {self.level} — {self.xp} XP"

    @classmethod
    def get(cls):
        """Always returns the single stats object, creating it if needed."""
        obj, _ = cls.objects.get_or_create(id=1)
        return obj

    def add_xp(self, amount):
        self.xp += amount
        self.level = (self.xp // 100) + 1
        self.save()

    def update_streak(self):
        from datetime import date, timedelta
        today = date.today()
        if self.last_solved_date == today:
            return  # already updated today
        elif self.last_solved_date == today - timedelta(days=1):
            self.streak += 1  # continued streak
        else:
            self.streak = 1   # streak broken, restart

        if self.streak > self.longest_streak:
            self.longest_streak = self.streak

        self.last_solved_date = today
        self.add_xp(5)  # streak bonus


def calculate_next_review(ease_factor, interval, repetitions, quality):
    """
    SM-2 spaced repetition algorithm.
    quality: 0=forgot, 1=hard, 2=okay, 3=easy, 4=perfect
    Returns: (new_ease_factor, new_interval, new_repetitions)
    """
    from datetime import date, timedelta

    if quality < 2:
        # Failed — reset
        repetitions = 0
        interval    = 1
    else:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 3
        else:
            interval = round(interval * ease_factor)
        repetitions += 1

    # Update ease factor
    ease_factor = ease_factor + (0.1 - (4 - quality) * (0.08 + (4 - quality) * 0.02))
    ease_factor = max(1.3, ease_factor)  # never below 1.3

    next_review = date.today() + timedelta(days=interval)
    return ease_factor, interval, repetitions, next_review


# user profile model
class UserProfile(models.Model):
    leetcode_username   = models.CharField(max_length=100, blank=True)
    gfg_username        = models.CharField(max_length=100, blank=True)
    codeforces_username = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = "User Profile"

    def __str__(self):
        return f"Profile (LC:{self.leetcode_username} GFG:{self.gfg_username} CF:{self.codeforces_username})"

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj