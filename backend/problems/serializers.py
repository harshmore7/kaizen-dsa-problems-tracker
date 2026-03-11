from rest_framework import serializers
from .models import Topic, Problem, Solution, Revision, UserStats


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'


class SolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solution
        fields = '__all__'


class RevisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Revision
        fields = '__all__'


class ProblemSerializer(serializers.ModelSerializer):
    solution   = SolutionSerializer(read_only=True)
    revisions  = RevisionSerializer(many=True, read_only=True)
    topics     = TopicSerializer(many=True, read_only=True)
    topic_ids  = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Topic.objects.all(), source='topics', write_only=True, required=False
    )

    class Meta:
        model  = Problem
        fields = [
            'id', 'title', 'link', 'platform', 'difficulty',
            'status', 'topics', 'topic_ids', 'notes', 'date_added',
            'solution', 'revisions',
            'ease_factor', 'interval', 'repetitions',
            'next_review_date', 'last_reviewed','time_spent_mins',
        ]


class UserStatsSerializer(serializers.ModelSerializer):
    xp_to_next_level   = serializers.SerializerMethodField()
    xp_in_current_level = serializers.SerializerMethodField()

    class Meta:
        model  = UserStats
        fields = [
            'xp', 'level', 'streak', 'longest_streak',
            'last_solved_date', 'xp_to_next_level', 'xp_in_current_level'
        ]

    def get_xp_to_next_level(self, obj):
        return obj.level * 100

    def get_xp_in_current_level(self, obj):
        return obj.xp % 100