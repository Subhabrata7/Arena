import React, { useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase/config";

import GlobalLayout from "./layouts/GlobalLayout";
import TournamentLayout from "./layouts/TournamentLayout";
import ChipTabs from "./components/ChipTabs";

// Global pages
import BrowseTournaments from "./pages/global/BrowseTournaments";
import MyTournaments from "./pages/global/MyTournaments";
import AdminPanel from "./pages/global/AdminPanel";
import ProfilePage from "./pages/global/ProfilePage";

// Tournament pages
import TournamentHome from "./pages/tournament/TournamentHome";
import PlayersTab from "./pages/tournament/PlayersTab";
import StandingsTab from "./pages/tournament/StandingsTab";
import FixturesTab from "./pages/tournament/FixturesTab";
import AnnouncementsTab from "./pages/tournament/AnnouncementsTab";
import { BracketTab, SupportTab } from "./pages/tournament/PlaceholderTabs";
import AdminTab from "./pages/tournament/AdminTab";

/* =========================
   WORKSPACE SHELL (FINAL)
========================= */

export default function WorkspaceShell({
  user,
  userProfile,
  tournaments = [],
  activeTournament,
  participants = [],
  matches = [],
  presence = {},
}) {
  /* -------------------------
     TAB DEFINITIONS
  -------------------------- */

  const GLOBAL_TABS = [
    "Browse Tournaments",
    "My Tournaments",
    "Profile",
    "Admin Panel",
  ];

  const TOURNEY_TABS = [
    "Home",
    "Players",
    "Standings",
    "Fixtures",
    "Bracket",
    "Announcements",
    "Support",
    "Admin",
  ];

  /* -------------------------
     STATE
  -------------------------- */

  const [globalTab, setGlobalTab] = useState("Browse Tournaments");
  const [tournamentTab, setTournamentTab] = useState("Home");
  const [activeTournamentId, setActiveTournamentId] = useState(
    activeTournament?.id || null
  );

  const [announcementReadAt, setAnnouncementReadAt] = useState(null);

  /* -------------------------
     ACTIVE TOURNAMENT
  -------------------------- */

  const tournament = useMemo(() => {
    if (!activeTournamentId) return null;
    return (
      tournaments.find((t) => t.id === activeTournamentId) ||
      activeTournament ||
      null
    );
  }, [activeTournamentId, tournaments, activeTournament]);

  const isAdmin = useMemo(() => {
    if (!tournament || !user) return false;
    if (tournament.ownerId === user.uid) return true;
    if (Array.isArray(tournament.adminIds)) {
      return tournament.adminIds.includes(user.uid);
    }
    return false;
  }, [tournament, user]);

  const isRegistered = useMemo(() => {
    if (!tournament || !user) return false;
    return (tournament.participants || []).includes(user.uid);
  }, [tournament, user]);

  /* =========================
     ANNOUNCEMENT READ STATE
  ========================= */

  useEffect(() => {
    if (!user || !activeTournamentId) return;

    const ref = doc(
      db,
      "announcementReads",
      `${activeTournamentId}_${user.uid}`
    );

    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        setAnnouncementReadAt(snap.data().lastReadAt);
      } else {
        setAnnouncementReadAt(null);
      }
    });
  }, [user, activeTournamentId]);

  const markAnnouncementsRead = async () => {
    if (!user || !activeTournamentId) return;

    const now = Date.now();
    const ref = doc(
      db,
      "announcementReads",
      `${activeTournamentId}_${user.uid}`
    );

    await setDoc(ref, {
      tournamentId: activeTournamentId,
      userId: user.uid,
      lastReadAt: now,
    });

    setAnnouncementReadAt(now);
  };

  /* =========================
     TOURNAMENT VIEW
  ========================= */

  if (tournament) {
    return (
      <TournamentLayout
        title={tournament.name}
        status={tournament.status}
        tabs={TOURNEY_TABS}
        activeTab={tournamentTab}
        onTabChange={setTournamentTab}
      >
        {/* HOME */}
        {tournamentTab === "Home" && (
          <TournamentHome
            tournament={tournament}
            myUid={user.uid}
            isRegistered={isRegistered}
            onJoin={() => {
              /* join flow handled in Module 5 */
            }}
          />
        )}

        {/* PLAYERS */}
        {tournamentTab === "Players" && (
          <PlayersTab
            participants={participants}
            presence={presence}
            mode={tournament.mode}
          />
        )}

        {/* STANDINGS */}
        {tournamentTab === "Standings" && (
          <StandingsTab
            tournament={tournament}
            participants={participants}
            matches={matches}
          />
        )}

        {/* FIXTURES */}
        {tournamentTab === "Fixtures" && (
          <FixturesTab
            tournament={tournament}
            user={user}
            isAdmin={isAdmin}
            matches={matches}
            participants={participants}
            presence={presence}
          />
        )}

        {/* BRACKET */}
        {tournamentTab === "Bracket" && <BracketTab />}

        {/* ANNOUNCEMENTS */}
        {tournamentTab === "Announcements" && (
          <AnnouncementsTab
            tournament={tournament}
            user={user}
            isAdmin={isAdmin}
            lastReadAt={announcementReadAt}
            onMarkRead={markAnnouncementsRead}
          />
        )}

        {/* SUPPORT */}
        {tournamentTab === "Support" && (
          <SupportTab
            tournament={tournament}
            user={user}
            isAdmin={isAdmin}
          />
        )}

        {/* ADMIN */}
        {tournamentTab === "Admin" && (
          <AdminTab
            tournament={tournament}
            participants={participants}
            matches={matches}
            user={user}
            isAdmin={isAdmin}
          />
        )}
      </TournamentLayout>
    );
  }

  /* =========================
     GLOBAL VIEW
  ========================= */

  return (
    <GlobalLayout
      title="PES Arena"
      subtitle="Global Workspace"
      actions={
        <ChipTabs
          tabs={GLOBAL_TABS}
          active={globalTab}
          onChange={setGlobalTab}
        />
      }
    >
      {globalTab === "Browse Tournaments" && (
        <BrowseTournaments
          tournaments={tournaments}
          onEnterTournament={(id) => {
            setActiveTournamentId(id);
            setTournamentTab("Home");
          }}
        />
      )}

      {globalTab === "My Tournaments" && (
        <MyTournaments
          tournaments={tournaments}
          myUid={user.uid}
          onEnterTournament={(id) => {
            setActiveTournamentId(id);
            setTournamentTab("Home");
          }}
        />
      )}

      {globalTab === "Profile" && (
        <ProfilePage userProfile={userProfile} />
      )}

      {globalTab === "Admin Panel" && (
        <AdminPanel
          tournaments={tournaments}
          myUid={user.uid}
          onEnterTournament={(id) => {
            setActiveTournamentId(id);
            setTournamentTab("Home");
          }}
        />
      )}
    </GlobalLayout>
  );
}
