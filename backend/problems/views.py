from .scraper import fetch_problem_from_url
import requests
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Topic, Problem, Solution, Revision, UserStats, UserProfile
from .platform_stats import fetch_leetcode_stats, fetch_gfg_stats, fetch_codeforces_stats
from .serializers import (
    TopicSerializer, ProblemSerializer,
    SolutionSerializer, RevisionSerializer,
    UserStatsSerializer
)


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all().order_by('name')
    serializer_class = TopicSerializer


class ProblemViewSet(viewsets.ModelViewSet):
    queryset         = Problem.objects.all().order_by('-date_added')
    serializer_class = ProblemSerializer

    def get_queryset(self):
        qs = Problem.objects.prefetch_related('topics', 'solution', 'revisions').order_by('-date_added')
        topic      = self.request.query_params.get('topic')
        difficulty = self.request.query_params.get('difficulty')
        status_    = self.request.query_params.get('status')
        platform   = self.request.query_params.get('platform')
        search     = self.request.query_params.get('search')
        if topic:      qs = qs.filter(topics__id=topic)
        if difficulty: qs = qs.filter(difficulty=difficulty)
        if status_:    qs = qs.filter(status=status_)
        if platform:   qs = qs.filter(platform=platform)
        if search:     qs = qs.filter(title__icontains=search)
        return qs

    def perform_create(self, serializer):
        problem = serializer.save()
        if problem.status == 'solved':
            xp_map = {'easy': 10, 'medium': 25, 'hard': 50}
            stats  = UserStats.get()
            stats.update_streak()
            stats.add_xp(xp_map.get(problem.difficulty, 10))

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post', 'put', 'patch'])
    def solution(self, request, pk=None):
        problem = self.get_object()
        sol, _  = Solution.objects.get_or_create(problem=problem)
        serializer = SolutionSerializer(sol, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def mark_solved(self, request, pk=None):
        problem        = self.get_object()
        already_solved = problem.status == 'solved'
        problem.status = 'solved'
        problem.save()

        xp_earned = 0
        if not already_solved:
            xp_map    = {'easy': 10, 'medium': 25, 'hard': 50}
            xp_earned = xp_map.get(problem.difficulty, 10)
            stats     = UserStats.get()
            stats.update_streak()
            stats.add_xp(xp_earned)

        return Response({'status': 'solved', 'xp_earned': xp_earned})

    @action(detail=True, methods=['post'])
    def log_time(self, request, pk=None):
        problem = self.get_object()
        minutes = int(request.data.get('minutes', 0))
        if minutes > 0:
            problem.time_spent_mins += minutes
            problem.save()
        return Response({'time_spent_mins': problem.time_spent_mins})

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        from datetime import date
        from .models import calculate_next_review

        problem = self.get_object()
        quality = int(request.data.get('quality', 2))

        new_ef, new_interval, new_reps, next_review = calculate_next_review(
            problem.ease_factor,
            problem.interval,
            problem.repetitions,
            quality
        )

        problem.ease_factor      = new_ef
        problem.interval         = new_interval
        problem.repetitions      = new_reps
        problem.next_review_date = next_review
        problem.last_reviewed    = date.today()

        if quality >= 2:
            problem.status = 'solved'
        else:
            problem.status = 'revision'
        problem.save()

        xp_map    = {0: 0, 1: 2, 2: 5, 3: 8, 4: 10}
        xp_earned = xp_map.get(quality, 5)
        stats     = UserStats.get()
        stats.update_streak()
        stats.add_xp(xp_earned)

        return Response({
            'next_review_date': next_review.isoformat(),
            'interval':         new_interval,
            'xp_earned':        xp_earned,
        })

    @action(detail=True, methods=['post'])
    def revise(self, request, pk=None):
        from datetime import date
        problem                  = self.get_object()
        problem.status           = 'revision'
        problem.next_review_date = date.today()
        problem.save()

        stats = UserStats.get()
        stats.add_xp(2)

        rev = Revision.objects.create(
            problem=problem,
            note=request.data.get('note', '')
        )
        return Response(RevisionSerializer(rev).data)


class SolutionViewSet(viewsets.ModelViewSet):
    queryset         = Solution.objects.all()
    serializer_class = SolutionSerializer


class RevisionViewSet(viewsets.ModelViewSet):
    queryset         = Revision.objects.all().order_by('-revised_on')
    serializer_class = RevisionSerializer


from rest_framework.views import APIView


class FetchProblemView(APIView):
    def post(self, request):
        url = request.data.get("url", "").strip()
        if not url:
            return Response({"error": "URL is required"}, status=status.HTTP_400_BAD_REQUEST)

        data = fetch_problem_from_url(url)
        if not data:
            return Response(
                {"error": "Could not fetch problem. Check the URL and try again."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        matched_topics = []
        for name in data.get("topics", []):
            topic = Topic.objects.filter(name__iexact=name).first()
            if topic:
                matched_topics.append({"id": topic.id, "name": topic.name})

        return Response({
            "title":      data["title"],
            "difficulty": data["difficulty"],
            "platform":   data["platform"],
            "topics":     matched_topics,
        })


class UserStatsView(APIView):
    def get(self, request):
        stats = UserStats.get()
        return Response(UserStatsSerializer(stats).data)


class ReviewQueueView(APIView):
    def get(self, request):
        from datetime import date
        from django.db.models import Q

        today = date.today()
        due   = Problem.objects.filter(
            Q(next_review_date__lte=today) |
            Q(status='revision', next_review_date__isnull=True)
        ).order_by('next_review_date').prefetch_related('topics', 'solution')

        serializer = ProblemSerializer(due, many=True)
        return Response({
            'count':    due.count(),
            'problems': serializer.data,
        })


class AnalyticsView(APIView):
    def get(self, request):
        from datetime import date, timedelta
        from django.db.models import Count, Q, Sum, Avg

        problems = Problem.objects.prefetch_related('topics').all()
        total    = problems.count()
        solved   = problems.filter(status='solved').count()
        revision = problems.filter(status='revision').count()
        unsolved = problems.filter(status='unsolved').count()

        # By difficulty
        by_difficulty = {}
        for d in ['easy', 'medium', 'hard']:
            by_difficulty[d] = {
                'total':  problems.filter(difficulty=d).count(),
                'solved': problems.filter(difficulty=d, status='solved').count(),
            }

        # By platform
        by_platform = {}
        for p in ['leetcode', 'gfg', 'codeforces', 'codechef', 'hackerrank', 'other']:
            count = problems.filter(platform=p).count()
            if count > 0:
                by_platform[p] = count

        # By topic
        topic_stats = []
        for topic in Topic.objects.all():
            t_problems = problems.filter(topics=topic)
            t_total    = t_problems.count()
            if t_total == 0:
                continue
            t_solved   = t_problems.filter(status='solved').count()
            t_unsolved = t_problems.exclude(status='solved').count()
            solve_rate = round((t_solved / t_total) * 100) if t_total > 0 else 0
            topic_stats.append({
                'topic':      topic.name,
                'total':      t_total,
                'solved':     t_solved,
                'unsolved':   t_unsolved,
                'solve_rate': solve_rate,
            })

        weaknesses     = sorted(topic_stats, key=lambda x: x['solve_rate'])[:8]
        most_practiced = sorted(topic_stats, key=lambda x: x['total'], reverse=True)[:8]

        # Heatmap
        today   = date.today()
        heatmap = {}
        for p in problems.filter(date_added__gte=today - timedelta(days=365)):
            key          = p.date_added.isoformat()
            heatmap[key] = heatmap.get(key, 0) + 1

        # Difficulty progression — last 6 months
        progression = []
        for i in range(5, -1, -1):
            month_start = (today.replace(day=1) - timedelta(days=i*30)).replace(day=1)
            month_end   = (month_start + timedelta(days=32)).replace(day=1)
            progression.append({
                'month':  month_start.strftime('%b'),
                'easy':   problems.filter(date_added__gte=month_start, date_added__lt=month_end, difficulty='easy').count(),
                'medium': problems.filter(date_added__gte=month_start, date_added__lt=month_end, difficulty='medium').count(),
                'hard':   problems.filter(date_added__gte=month_start, date_added__lt=month_end, difficulty='hard').count(),
            })

        # Time stats
        time_data  = problems.aggregate(
            total_mins=Sum('time_spent_mins'),
            avg_mins=Avg('time_spent_mins')
        )
        total_time = time_data['total_mins'] or 0
        avg_time   = round(time_data['avg_mins'] or 0)

        slowest = list(
            problems.filter(time_spent_mins__gt=0)
            .order_by('-time_spent_mins')
            .values('id', 'title', 'time_spent_mins', 'difficulty')[:5]
        )

        # User stats
        stats = UserStats.get()

        return Response({
            'overview': {
                'total':      total,
                'solved':     solved,
                'revision':   revision,
                'unsolved':   unsolved,
                'solve_rate': round((solved / total) * 100) if total > 0 else 0,
            },
            'by_difficulty':  by_difficulty,
            'by_platform':    by_platform,
            'weaknesses':     weaknesses,
            'most_practiced': most_practiced,
            'heatmap':        heatmap,
            'progression':    progression,
            'time': {
                'total_mins': total_time,
                'avg_mins':   avg_time,
                'slowest':    slowest,
            },
            'user_stats': {
                'xp':                 stats.xp,
                'level':              stats.level,
                'streak':             stats.streak,
                'longest_streak':     stats.longest_streak,
                'xp_in_current_level': stats.xp % 100,
            },
        })
    


class UserProfileView(APIView):
    def get(self, request):
        profile = UserProfile.get()
        from .serializers import UserProfileSerializer
        return Response(UserProfileSerializer(profile).data)

    def put(self, request):
        profile = UserProfile.get()
        from .serializers import UserProfileSerializer
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlatformStatsView(APIView):
    def get(self, request):
        profile = UserProfile.get()
        lc = fetch_leetcode_stats(profile.leetcode_username)
        gfg = fetch_gfg_stats(profile.gfg_username)
        cf = fetch_codeforces_stats(profile.codeforces_username)

        # Combined heatmap — merge LC + CF submission dates
        heatmap = {}
        try:
            if profile.leetcode_username:
                query = """
                query recentAC($username: String!) {
                    recentAcSubmissionList(username: $username, limit: 20) {
                        timestamp
                    }
                }
                """
                res = requests.post(
                    "https://leetcode.com/graphql",
                    json={"query": query, "variables": {"username": profile.leetcode_username}},
                    headers={"Content-Type": "application/json", "Referer": "https://leetcode.com",
                             "User-Agent": "Mozilla/5.0"},
                    timeout=10
                )
                from datetime import datetime
                for s in res.json().get("data", {}).get("recentAcSubmissionList", []):
                    day = datetime.fromtimestamp(int(s["timestamp"])).strftime("%Y-%m-%d")
                    heatmap[day] = heatmap.get(day, 0) + 1
        except Exception:
            pass

        return Response({
            "leetcode":   lc,
            "gfg":        gfg,
            "codeforces": cf,
            "heatmap":    heatmap,
        })