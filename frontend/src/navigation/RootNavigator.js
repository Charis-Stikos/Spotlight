import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { useBadge } from '../badge/BadgeContext';
import { colors } from '../theme/theme';

import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { TheatreScreen } from '../screens/TheatreScreen';
import { ShowDetailsScreen } from '../screens/ShowDetailsScreen';
import { SeatMapScreen } from '../screens/SeatMapScreen';
import { MyReservationsScreen } from '../screens/MyReservationsScreen';
import { ReservationDetailsScreen } from '../screens/ReservationDetailsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const stackOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '800' },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};


const DiscoverNav = createNativeStackNavigator();
function DiscoverStack() {
  return (
    <DiscoverNav.Navigator screenOptions={stackOptions}>
      <DiscoverNav.Screen name="Discover" component={DiscoverScreen} options={{ headerShown: false }} />
      <DiscoverNav.Screen name="Theatre" component={TheatreScreen} options={({ route }) => ({ title: route.params?.name || 'Theatre' })} />
      <DiscoverNav.Screen name="ShowDetails" component={ShowDetailsScreen} options={{ headerShown: false }} />
      <DiscoverNav.Screen name="SeatMap" component={SeatMapScreen} options={{ headerShown: false }} />
    </DiscoverNav.Navigator>
  );
}

const SearchNav = createNativeStackNavigator();
function SearchStack() {
  return (
    <SearchNav.Navigator screenOptions={stackOptions}>
      <SearchNav.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
      <SearchNav.Screen name="Theatre" component={TheatreScreen} options={({ route }) => ({ title: route.params?.name || 'Theatre' })} />
      <SearchNav.Screen name="ShowDetails" component={ShowDetailsScreen} options={{ headerShown: false }} />
      <SearchNav.Screen name="SeatMap" component={SeatMapScreen} options={{ headerShown: false }} />
    </SearchNav.Navigator>
  );
}

const TicketsNav = createNativeStackNavigator();
function TicketsStack() {
  return (
    <TicketsNav.Navigator screenOptions={stackOptions}>
      <TicketsNav.Screen name="MyReservations" component={MyReservationsScreen} options={{ title: 'My Tickets' }} />
      <TicketsNav.Screen name="ReservationDetails" component={ReservationDetailsScreen} options={{ title: 'Reservation' }} />
      <TicketsNav.Screen name="SeatMap" component={SeatMapScreen} options={{ headerShown: false }} />
    </TicketsNav.Navigator>
  );
}

const ProfileNav = createNativeStackNavigator();
function ProfileStack() {
  return (
    <ProfileNav.Navigator screenOptions={stackOptions}>
      <ProfileNav.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileNav.Screen name="Theatre" component={TheatreScreen} options={({ route }) => ({ title: route.params?.name || 'Theatre' })} />
      <ProfileNav.Screen name="ShowDetails" component={ShowDetailsScreen} options={{ headerShown: false }} />
      <ProfileNav.Screen name="SeatMap" component={SeatMapScreen} options={{ headerShown: false }} />
    </ProfileNav.Navigator>
  );
}

const ICONS = {
  DiscoverTab: ['film', 'film-outline'],
  SearchTab: ['search', 'search-outline'],
  TicketsTab: ['ticket', 'ticket-outline'],
  ProfileTab: ['person', 'person-outline'],
};

const Tab = createBottomTabNavigator();
function AppTabs() {
  const { ticketsCount } = useBadge();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // Πάνω από το home indicator (iOS) / gesture bar (Android) με προσθήκη του bottom inset
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 58 + insets.bottom, paddingBottom: insets.bottom + 6, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size, focused }) => {
          const [active, inactive] = ICONS[route.name];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="DiscoverTab" component={DiscoverStack} options={{ title: 'Discover' }} />
      <Tab.Screen name="SearchTab" component={SearchStack} options={{ title: 'Search' }} />
      <Tab.Screen
        name="TicketsTab"
        component={TicketsStack}
        options={{
          title: 'Tickets',
          tabBarBadge: ticketsCount > 0 ? ticketsCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent, color: '#fff', fontSize: 11, fontWeight: '700' },
        }}
      />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

const RootStack = createNativeStackNavigator();

export function RootNavigator() {
  const { restoring } = useAuth();

  if (restoring) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Η εφαρμογή ανοίγει πάντα στις καρτέλες (περιήγηση ως επισκέπτης)· Login/Register ως modal κατ' απαίτηση
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs" component={AppTabs} />
      <RootStack.Group screenOptions={{ presentation: 'modal' }}>
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Register" component={RegisterScreen} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
}
