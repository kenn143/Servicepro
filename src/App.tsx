import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Buttons from "./pages/UiElements/Buttons";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FileTracker from "./pages/FileTracker";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { FC, ReactNode } from "react";
import QuotationList from "./pages/QuotationList";
import Quote from "./pages/Quote";
import Preview from "./pages/Preview";
import EditPage from "./pages/EditPage";
import ApprovedPage from "./pages/ApprovedPage";
import CreateInvoice from "./pages/Invoice/CreateInvoice";
import InvoiceList from "./pages/Invoice/InvoiceList";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Dashboard Layout */}
        <Route element={<AppLayout />}>
          <Route
            index
            path="/"
            element={<PageWrapper><Home /></PageWrapper>}
          />
          <Route
            path="/file-tracker"
            element={<PageWrapper><FileTracker /></PageWrapper>}
          />
          <Route
            path="/quotation-list"
            element={<PageWrapper><QuotationList /></PageWrapper>}
          />
         <Route
            path="/quote-entry"
            element={<PageWrapper><Quote /></PageWrapper>}
          />
           <Route
            path="/quotation"
            element={<PageWrapper><Preview /></PageWrapper>}
          />
          <Route
            path="/edit/:id"
            element={<PageWrapper><EditPage /></PageWrapper>}
          />
           <Route
            path="/Approved"
            element={<PageWrapper><ApprovedPage /></PageWrapper>}
          />
           <Route
            path="/create-invoice"
            element={<PageWrapper><CreateInvoice /></PageWrapper>}
          />
          <Route
            path="/invoice-list"
            element={<PageWrapper><InvoiceList /></PageWrapper>}
          />
          <Route
            path="/calendar"
            element={<PageWrapper><Calendar /></PageWrapper>}
          />
          <Route
            path="/basic-tables"
            element={<PageWrapper><BasicTables /></PageWrapper>}
          />
          <Route
            path="/buttons"
            element={<PageWrapper><Buttons /></PageWrapper>}
          />
          <Route
            path="/images"
            element={<PageWrapper><Images /></PageWrapper>}
          />
          <Route
            path="/videos"
            element={<PageWrapper><Videos /></PageWrapper>}
          />
          <Route
            path="/bar-chart"
            element={<PageWrapper><BarChart /></PageWrapper>}
          />
        </Route>

        {/* Auth Layout */}
        <Route path="/signin" element={<PageWrapper><SignIn /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><SignUp /></PageWrapper>} />

        {/* Fallback */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

const PageWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AnimatedRoutes />
    </Router>
  );
}
