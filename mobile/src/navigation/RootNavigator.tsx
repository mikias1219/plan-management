import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, View } from 'react-native';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { TodayScreen } from '../screens/today/TodayScreen';
import { PlanScreen } from '../screens/plan/PlanScreen';
import { YearSetupScreen } from '../screens/plan/YearSetupScreen';
import { GoalsScreen, HabitsScreen, TasksScreen, AchievementsScreen } from '../screens/plan/ListScreens';
import { GoalDetailScreen, HabitDetailScreen } from '../screens/plan/DetailScreens';
import { PlanDayScreen, PlanWeekScreen, PlanMonthScreen, PlanYearScreen } from '../screens/plan/PlanPeriodScreen';
import { CreateGoalScreen, CreateTaskScreen, CreateAchievementScreen } from '../screens/plan/CreateScreens';
import { CaptureScreen } from '../screens/capture/CaptureScreen';
import { StatsScreen } from '../screens/stats/StatsScreen';
import { WeeklyReviewScreen, MonthlyReviewScreen, YearlyReviewScreen } from '../screens/stats/ReviewScreen';
import { KnowledgeHomeScreen, KnowledgeAreaScreen } from '../screens/knowledge/KnowledgeHomeScreen';
import { KnowledgeEditorScreen } from '../screens/knowledge/KnowledgeEditorScreen';
import { JournalScreen } from '../screens/journal/JournalScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { useSession } from '../api/client';
import { colors } from '../theme';

const Auth = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const Root = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.bg, text: colors.text, border: colors.border, primary: colors.accent },
};

function AuthStack() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="Login" component={LoginScreen} />
      <Auth.Screen name="Register" component={RegisterScreen} />
      <Auth.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Auth.Navigator>
  );
}

function Dummy() {
  return <View />;
}

function MainTabs() {
  const navigation = useNavigation<{ navigate: (name: string) => void }>();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 64, paddingBottom: 8 },
      }}
    >
      <Tabs.Screen
        name="TodayTab"
        component={TodayScreen}
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Ionicons name="sunny-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="PlanTab"
        component={PlanScreen}
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="PlusTab"
        component={Dummy}
        options={{
          title: '',
          tabBarIcon: () => (
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Ionicons name="add" color="#fff" size={28} />
            </View>
          ),
          tabBarButton: ({ children }) => (
            <Pressable
              onPress={() => navigation.navigate('Capture')}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              {children}
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="StatsTab"
        component={StatsScreen}
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" color={color} size={size} />,
        }}
      />
    </Tabs.Navigator>
  );
}

function AppStack() {
  return (
    <Root.Navigator screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text }}>
      <Root.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
      <Root.Screen name="Capture" component={CaptureScreen as never} options={{ title: 'Quick add', presentation: 'modal' }} />
      <Root.Screen name="PlanDay" component={PlanDayScreen} options={{ title: 'Day' }} />
      <Root.Screen name="PlanWeek" component={PlanWeekScreen} options={{ title: 'Week' }} />
      <Root.Screen name="PlanMonth" component={PlanMonthScreen} options={{ title: 'Month' }} />
      <Root.Screen name="PlanYear" component={PlanYearScreen} options={{ title: 'Year' }} />
      <Root.Screen name="YearSetup" component={YearSetupScreen} options={{ title: 'Personal year' }} />
      <Root.Screen name="Goals" component={GoalsScreen} options={{ title: 'Goals' }} />
      <Root.Screen name="CreateGoal" component={CreateGoalScreen} options={{ title: 'New goal' }} />
      <Root.Screen name="GoalDetail" component={GoalDetailScreen as never} options={{ title: 'Goal' }} />
      <Root.Screen name="Habits" component={HabitsScreen} options={{ title: 'Habits' }} />
      <Root.Screen name="HabitDetail" component={HabitDetailScreen as never} options={{ title: 'Habit' }} />
      <Root.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tasks' }} />
      <Root.Screen name="CreateTask" component={CreateTaskScreen} options={{ title: 'New task' }} />
      <Root.Screen name="Knowledge" component={KnowledgeHomeScreen} options={{ title: 'Knowledge' }} />
      <Root.Screen name="KnowledgeArea" component={KnowledgeAreaScreen as never} options={{ title: 'Topic' }} />
      <Root.Screen name="KnowledgeEditor" component={KnowledgeEditorScreen as never} options={{ title: 'Editor' }} />
      <Root.Screen name="Journal" component={JournalScreen} options={{ title: 'Journal' }} />
      <Root.Screen name="Achievements" component={AchievementsScreen} options={{ title: 'Achievements' }} />
      <Root.Screen name="CreateAchievement" component={CreateAchievementScreen} options={{ title: 'New achievement' }} />
      <Root.Screen name="WeeklyReview" component={WeeklyReviewScreen} options={{ title: 'Weekly review' }} />
      <Root.Screen name="MonthlyReview" component={MonthlyReviewScreen} options={{ title: 'Monthly review' }} />
      <Root.Screen name="YearlyReview" component={YearlyReviewScreen} options={{ title: 'Year review' }} />
      <Root.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Root.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
    </Root.Navigator>
  );
}

export function RootNavigator() {
  const user = useSession((s) => s.user);
  const hydrated = useSession((s) => s.hydrated);
  if (!hydrated) {
    return null;
  }
  return (
    <NavigationContainer theme={navTheme}>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
