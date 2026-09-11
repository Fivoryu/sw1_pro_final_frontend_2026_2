import { useState } from "react";
import { SessionService } from "./application/sessionService";
import { SubscriptionService } from "./application/subscriptionService";
import { UserManagementService } from "./application/userManagementService";
import { ApiClient } from "./data/apiClient";
import { AgentInvitationAcceptancePage } from "./features/agent-invitations/AgentInvitationAcceptancePage";
import { LoginPage } from "./features/auth/LoginPage";
import { SubscriptionDashboard } from "./features/subscription/SubscriptionDashboard";
import { UserManagementPage } from "./features/user-management/UserManagementPage";
export default function App() {
  const [api] = useState(() => new ApiClient()),
    [session] = useState(() => new SessionService(api)),
    [subscription] = useState(() => new SubscriptionService(session)),
    [users] = useState(() => new UserManagementService(api, session)),
    [authenticated, setAuthenticated] = useState(() =>
      session.isAuthenticated(),
    );
  if (!authenticated && window.location.hash.startsWith("#token="))
    return <AgentInvitationAcceptancePage service={users} />;
  return authenticated ? (
    <>
      <SubscriptionDashboard service={subscription} />
      <UserManagementPage service={users} />
    </>
  ) : (
    <LoginPage
      session={session}
      onAuthenticated={() => setAuthenticated(true)}
    />
  );
}
