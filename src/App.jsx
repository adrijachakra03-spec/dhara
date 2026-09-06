import { BrowserRouter, Routes, Route } from "react-router-dom"

import Landing from "./pages/Landing"
import SignIn from "./pages/SignIn"

// ================= COMPANY =================
import CompanyDashboard from "./pages/CompanyDashboard"
import ProjectProposal from "./pages/ProjectProposal"
import ProjectTracking from "./pages/ProjectTracking"
import CompanyRevision from "./pages/CompanyRevision"

// ================= DISTRICT AUTHORITY =================
import DistrictDashboard from "./pages/DistrictDashboard"
import ProposalReview from "./pages/ProposalReview"
import DistrictFieldReview from "./pages/DistrictFieldReview"

// ================= FIELD OFFICER =================
import FieldOfficerDashboard from "./pages/FieldOfficerDashboard"
import FieldVerification from "./pages/FieldVerification"

// ================= STATE AUTHORITY =================
import StateDashboard from "./pages/StateDashboard"
import StateProjectReview from "./pages/StateProjectReview"

// ================= CENTRAL AUTHORITY =================
import CentralDashboard from "./pages/CentralDashboard"
import CentralProjectReview from "./pages/CentralProjectReview"

// ================= CITIZEN =================
import CitizenDashboard from "./pages/CitizenDashboard"

// ================= SYSTEM =================
import BlockchainLedger from "./pages/BlockchainLedger"
import CompensationDashboard from "./pages/CompensationDashboard"
import ImplementationDashboard from "./pages/ImplementationDashboard"
import ProjectCompletionDashboard from "./pages/ProjectCompletionDashboard"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            LANDING
        ===================================================== */}

        <Route
          path="/"
          element={<Landing />}
        />

        {/* =====================================================
            SIGN IN
        ===================================================== */}

        <Route
          path="/signin"
          element={<SignIn />}
        />

        {/* =====================================================
            COMPANY PORTAL
        ===================================================== */}

        <Route
          path="/portal/company"
          element={<CompanyDashboard />}
        />

        <Route
          path="/portal/company/propose"
          element={<ProjectProposal />}
        />

        <Route
          path="/portal/company/project/:projectId"
          element={<ProjectTracking />}
        />

        <Route
          path="/portal/company/project/:projectId/revise"
          element={<CompanyRevision />}
        />

        {/* =====================================================
            DISTRICT AUTHORITY
        ===================================================== */}

        <Route
          path="/portal/district"
          element={<DistrictDashboard />}
        />

        <Route
          path="/portal/district/proposal/:projectId"
          element={<ProposalReview />}
        />

        <Route
          path="/portal/district/field-review/:projectId"
          element={<DistrictFieldReview />}
        />

        {/* =====================================================
            FIELD OFFICER
        ===================================================== */}

        <Route
          path="/portal/field"
          element={<FieldOfficerDashboard />}
        />

        <Route
          path="/portal/field/project/:projectId"
          element={<FieldVerification />}
        />

        {/* =====================================================
            STATE AUTHORITY
        ===================================================== */}

        <Route
          path="/portal/state"
          element={<StateDashboard />}
        />

        <Route
          path="/portal/state/project/:projectId"
          element={<StateProjectReview />}
        />

        {/* =====================================================
            CENTRAL AUTHORITY
        ===================================================== */}

        <Route
          path="/portal/central"
          element={<CentralDashboard />}
        />

        <Route
          path="/portal/central/project/:projectId"
          element={<CentralProjectReview />}
        />

        {/* =====================================================
            SLCO / SPECIAL LAND ACQUISITION OFFICER
            Compensation approval + payment
        ===================================================== */}

        <Route
          path="/portal/slco"
          element={<CompensationDashboard />}
        />

        {/* =====================================================
            CITIZEN PORTAL
        ===================================================== */}

        <Route
          path="/portal/citizen"
          element={<CitizenDashboard />}
        />

        {/* =====================================================
            BLOCKCHAIN LEDGER
        ===================================================== */}

        <Route
          path="/portal/blockchain"
          element={<BlockchainLedger />}
        />

        {/* =====================================================
            LEGACY COMPENSATION ROUTE
        ===================================================== */}

        <Route
          path="/portal/compensation"
          element={<CompensationDashboard />}
        />

        {/* =====================================================
            GOVERNMENT IMPLEMENTATION
        ===================================================== */}

        <Route
          path="/portal/implementation"
          element={<ImplementationDashboard />}
        />

        {/* =====================================================
            PROJECT COMPLETION
        ===================================================== */}

        <Route
          path="/portal/completion"
          element={<ProjectCompletionDashboard />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App