import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { DashboardScreen } from '../screens/home/DashboardScreen';
import { TodayScreen } from '../screens/today/TodayScreen';
import { PlanScreen } from '../screens/plan/PlanScreen';
import { YearSetupScreen } from '../screens/plan/YearSetupScreen';
import { GoalsScreen, HabitsScreen, TasksScreen, AchievementsScreen } from '../screens/plan/ListScreens';
import { GoalDetailScreen, HabitDetailScreen } from '../screens/plan/DetailScreens';
import { PlanDayScreen, PlanWeekScreen, PlanMonthScreen, PlanYearScreen } from '../screens/plan/PlanPeriodScreen';
import { CreateGoalScreen, CreateTaskScreen, CreateAchievementScreen } from '../screens/plan/CreateScreens';
import { CaptureScreen } from '../screens/capture/CaptureScreen';
import { WeeklyReviewScreen, MonthlyReviewScreen, YearlyReviewScreen } from '../screens/stats/ReviewScreen';
import { KnowledgeHomeScreen, KnowledgeAreaScreen } from '../screens/knowledge/KnowledgeHomeScreen';
import { KnowledgeEditorScreen } from '../screens/knowledge/KnowledgeEditorScreen';
import { JournalScreen } from '../screens/journal/JournalScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { MoneyScreen } from '../screens/money/MoneyScreen';
import { AddTransactionScreen } from '../screens/money/AddTransactionScreen';
import { BudgetScreen } from '../screens/money/BudgetScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useSession } from '../api/client';
import { colors } from '../theme';

const Auth = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const Root = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
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

function tabIcon(outline: keyof typeof Ionicons.glyphMap, filled: keyof typeof Ionicons.glyphMap) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? filled : outline} color={color} size={22} />
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentDim,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="HomeTab"
        component={DashboardScreen}
        options={{ title: 'Home', tabBarIcon: tabIcon('grid-outline', 'grid') }}
      />
      <Tabs.Screen
        name="TodayTab"
        component={TodayScreen}
        options={{ title: 'Today', tabBarIcon: tabIcon('sunny-outline', 'sunny') }}
      />
      <Tabs.Screen
        name="PlanTab"
        component={PlanScreen}
        options={{ title: 'Plan', tabBarIcon: tabIcon('calendar-outline', 'calendar') }}
      />
      <Tabs.Screen
        name="MoneyTab"
        component={MoneyScreen}
        options={{ title: 'Money', tabBarIcon: tabIcon('wallet-outline', 'wallet') }}
      />
      <Tabs.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile', tabBarIcon: tabIcon('person-outline', 'person') }}
      />
    </Tabs.Navigator>
  );
}

function AppStack() {
  return (
    <Root.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Root.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
      <Root.Screen name="Capture" component={CaptureScreen as never} options={{ title: 'Quick add', presentation: 'modal' }} />
      <Root.Screen name="AddTransaction" component={AddTransactionScreen as never} options={{ title: 'Add money' }} />
      <Root.Screen name="Budget" component={BudgetScreen} options={{ title: 'Budget' }} />
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
      <Root.Screen name="Knowledge" component={KnowledgeHomeScreen} options={{ title: 'Notes' }} />
      <Root.Screen name="KnowledgeArea" component={KnowledgeAreaScreen as never} options={{ title: 'Topic' }} />
      <Root.Screen name="KnowledgeEditor" component={KnowledgeEditorScreen as never} options={{ title: 'Editor' }} />
      <Root.Screen name="Journal" component={JournalScreen} options={{ title: 'Journal' }} />
      <Root.Screen name="Achievements" component={AchievementsScreen} options={{ title: 'Achievements' }} />
      <Root.Screen name="CreateAchievement" component={CreateAchievementScreen} options={{ title: 'New achievement' }} />
      <Root.Screen name="WeeklyReview" component={WeeklyReviewScreen} options={{ title: 'Weekly review' }} />
      <Root.Screen name="MonthlyReview" component={MonthlyReviewScreen} options={{ title: 'Monthly review' }} />
      <Root.Screen name="YearlyReview" component={YearlyReviewScreen} options={{ title: 'Year review' }} />
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
