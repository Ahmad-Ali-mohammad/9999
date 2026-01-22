import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import BudgetCategories from './pages/BudgetCategories';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import Accounts from './pages/Accounts';
import Categories from './pages/Categories';
import Projects from './pages/Projects';
import Tags from './pages/Tags';
import Alerts from './pages/Alerts';
import Receipts from './pages/Receipts';
import Profile from './pages/Profile';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Finance Hub */}
                <Route path="/finance">
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="accounts" element={<Accounts />} />
                  <Route path="receipts" element={<Receipts />} />
                </Route>

                {/* Organization */}
                <Route path="/organization">
                  <Route path="categories" element={<Categories />} />
                  <Route path="budget-categories" element={<BudgetCategories />} />
                  <Route path="tags" element={<Tags />} />
                  <Route path="projects" element={<Projects />} />
                </Route>

                {/* Planning */}
                <Route path="/planning">
                  <Route path="budgets" element={<Budgets />} />
                  <Route path="goals" element={<Goals />} />
                </Route>

                {/* Analytics */}
                <Route path="/analytics">
                  <Route path="reports" element={<Reports />} />
                  <Route path="alerts" element={<Alerts />} />
                </Route>

                {/* Settings */}
                <Route path="/settings">
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
