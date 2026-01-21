
import React, { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "./firebase/config";


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
import { BracketTab, AnnouncementsTab, SupportTab, AdminTab } from "./pages/tournament/PlaceholderTabs";
import WorkspaceShell from "./WorkspaceShell";

/**
 * Module 1 = only the skeleton and the correct visual foundation.
 * In Module 2 we will plug real pages (Browse/Profile/Tournament etc).
 */
import {
  listenPublicTournaments,
  listenTournament,
  listenMyTournaments,
  listenTournamentParticipants,
  listenTournamentMatches,
  listenTournamentAnnouncements,
  listenSupportTicketsForUser,
  listenSupportTicketsForAdmin,
  listenPresence,
} from "./firebase/queries";
/* ---------------------------
   Small UI helpers (Module 1)
---------------------------- */

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}



/* =========================
   SMALL HELPERS
========================= */

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#39FF14] animate-spin" />
      <div className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-600">
        Syncing…
      </div>
    </div>
  );
}

/* =========================
   PUBLIC LANDING (ANONYMOUS)
========================= */

function PublicLanding({ onOpenAuth }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">

        {/* HERO */}
        <div className="rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-8 md:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#39FF14]/10 blur-3xl rounded-full" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5">
              <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                PES Arena Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
              Run eFootball Tournaments Like a Pro
            </h1>

            <p className="text-slate-400 font-bold leading-relaxed max-w-3xl">
              League, Knockout, Group + Knockout tournaments with live standings,
              match confirmation, disputes, announcements, sponsor banners,
              private support chat, and admin control — all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={onOpenAuth}
                className="px-10 py-5 rounded-2xl bg-[#39FF14] text-black font-black uppercase tracking-widest text-[11px] shadow-[0_0_35px_rgba(57,255,20,0.25)] hover:scale-[1.01]"
              >
                Login / Sign Up
              </button>

              <div className="px-10 py-5 rounded-2xl border border-white/10 bg-white/5 text-slate-300 font-black uppercase tracking-widest text-[11px]">
                No preview • No data leakage
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <FeatureCard
            title="For Organizers"
            items={[
              "Create League / Knockout / Group + Knockout tournaments",
              "Approve players & manage admins",
              "Generate fixtures, matchdays & brackets",
              "Announcements with unread tracking",
              "Dispute center & strike management",
              "Sponsor rotation & matchday banners",
              "Auto resolution + admin override",
            ]}
          />

          <FeatureCard
            title="For Players"
            items={[
              "Join free or paid tournaments",
              "Ready check & score submission",
              "Opponent confirmation or dispute",
              "Accuracy rating for submissions",
              "Private support chat with admin",
              "Live standings, fixtures & bracket",
              "Auto bans after repeated disputes",
            ]}
          />
        </div>

        <div className="text-center text-slate-700 font-black uppercase tracking-[0.4em] text-[10px] mt-14">
          Mobile-first • Production-grade
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, items }) {
  return (
    <div className="rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-8 md:p-10 shadow-2xl">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
          {title}
        </h2>
        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#39FF14]">
          Capability
        </span>
      </div>

      <div className="mt-8 space-y-4">
        {items.map((x) => (
          <div
            key={x}
            className="flex gap-3 items-start border border-white/5 bg-white/5 rounded-2xl px-6 py-4"
          >
            <div className="mt-1 w-2 h-2 rounded-full bg-[#39FF14]" />
            <div className="text-slate-300 font-bold">{x}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================
   AUTH MODAL (BASIC)
========================= */

function AuthWall({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-[2.5rem] border border-[#39FF14]/20 bg-[#0a0a0a] p-10 shadow-2xl">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black italic uppercase">
              Login / Sign Up
            </h3>
            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mt-2">
              Firebase Auth (Module 2 UI)
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-200 font-black uppercase text-[10px]"
          >
            Close
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black p-6 text-slate-400 font-bold">
          Your full Auth UI plugs here.  
          This shell is intentional & safe.
        </div>
      </div>
    </div>
  );
}
function export default function WorkspaceShell({
  user,
  userProfile,
}) {
  /* -------------------------
     GLOBAL STATE
  -------------------------- */
  const GLOBAL_TABS = ["Browse Tournaments", "My Tournaments", "Profile", "Admin Panel"];
  const TOURNEY_TABS = ["Home", "Players", "Standings", "Fixtures", "Bracket", "Announcements", "Support", "Admin"];

  const [globalTab, setGlobalTab] = useState("Browse Tournaments");
  const [tournamentTab, setTournamentTab] = useState("Home");

  const [tournaments, setTournaments] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);

  const [activeTournamentId, setActiveTournamentId] = useState(null);
  const [activeTournament, setActiveTournament] = useState(null);

  const [participants, setParticipants] = useState([]);
  const [matches, setMatches] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [presence, setPresence] = useState({});

  /* -------------------------
     LISTEN: PUBLIC TOURNAMENTS
  -------------------------- */
  useEffect(() => {
    const unsub = listenPublicTournaments(setTournaments);
    return () => unsub && unsub();
  }, []);

  /* -------------------------
     LISTEN: MY TOURNAMENTS
  -------------------------- */
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = listenMyTournaments(user.uid, setMyTournaments);
    return () => unsub && unsub();
  }, [user?.uid]);

  /* -------------------------
     LISTEN: ACTIVE TOURNAMENT
  -------------------------- */
  useEffect(() => {
    if (!activeTournamentId) {
      setActiveTournament(null);
      return;
    }
    const unsub = listenTournament(activeTournamentId, setActiveTournament);
    return () => unsub && unsub();
  }, [activeTournamentId]);

  /* -------------------------
     LISTEN: PARTICIPANTS
  -------------------------- */
  useEffect(() => {
    if (!activeTournamentId) return;
    const unsub = listenTournamentParticipants(activeTournamentId, setParticipants);
    return () => unsub && unsub();
  }, [activeTournamentId]);

  /* -------------------------
     LISTEN: MATCHES
  -------------------------- */
  useEffect(() => {
    if (!activeTournamentId) return;
    const unsub = listenTournamentMatches(activeTournamentId, setMatches);
    return () => unsub && unsub();
  }, [activeTournamentId]);

  /* -------------------------
     LISTEN: ANNOUNCEMENTS
  -------------------------- */
  useEffect(() => {
    if (!activeTournamentId) return;
    const unsub = listenTournamentAnnouncements(activeTournamentId, setAnnouncements);
    return () => unsub && unsub();
  }, [activeTournamentId]);

  /* -------------------------
     LISTEN: SUPPORT
  -------------------------- */
  useEffect(() => {
    if (!activeTournamentId || !user?.uid) return;

    const isManager =
      activeTournament?.ownerId === user.uid ||
      (activeTournament?.adminIds || []).includes(user.uid);

    const unsub = isManager
      ? listenSupportTicketsForAdmin(activeTournamentId, setSupportTickets)
      : listenSupportTicketsForUser(activeTournamentId, user.uid, setSupportTickets);

    return () => unsub && unsub();
  }, [activeTournamentId, activeTournament, user?.uid]);

  /* -------------------------
     LISTEN: PRESENCE (RTDB)
  -------------------------- */
  useEffect(() => {
    if (!activeTournamentId) return;
    const off = listenPresence(activeTournamentId, setPresence);
    return () => off && off();
  }, [activeTournamentId]);

  /* -------------------------
     HELPERS
  -------------------------- */
  const onEnterTournament = (id) => {
    setActiveTournamentId(id);
    setTournamentTab("Home");
  };

  const onExitTournament = () => {
    setActiveTournamentId(null);
    setTournamentTab("Home");
  };

  const isRegistered = useMemo(() => {
    if (!activeTournament || !user?.uid) return false;
    return (activeTournament.participants || []).includes(user.uid);
  }, [activeTournament, user?.uid]);

  /* =========================
     TOURNAMENT VIEW
  ========================= */
  if (activeTournament) {
    return (
      <TournamentLayout
        title={activeTournament.name}
        status={activeTournament.status}
        tabs={TOURNEY_TABS}
        activeTab={tournamentTab}
        onTabChange={setTournamentTab}
      >
        <div className="mb-6 flex justify-end">
          <button
            onClick={onExitTournament}
            className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-black uppercase text-[10px]"
          >
            Exit Tournament
          </button>
        </div>

        {tournamentTab === "Home" && (
          <TournamentHome
            tournament={activeTournament}
            myUid={user.uid}
            isRegistered={isRegistered}
          />
        )}

        {tournamentTab === "Players" && (
          <PlayersTab participants={participants} presence={presence} />
        )}

        {tournamentTab === "Standings" && (
          <StandingsTab participants={participants} matches={matches} />
        )}

        {tournamentTab === "Fixtures" && (
          <FixturesTab matches={matches} />
        )}

        {tournamentTab === "Bracket" && <BracketTab />}

        {tournamentTab === "Announcements" && (
          <AnnouncementsTab announcements={announcements} />
        )}

        {tournamentTab === "Support" && (
          <SupportTab tickets={supportTickets} />
        )}

        {tournamentTab === "Admin" && (
          <AdminTab
            tournament={activeTournament}
            participants={participants}
            matches={matches}
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
      subtitle="Tournament Platform"
      actions={
        <ChipTabs tabs={GLOBAL_TABS} active={globalTab} onChange={setGlobalTab} />
      }
    >
      {globalTab === "Browse Tournaments" && (
        <BrowseTournaments
          tournaments={tournaments}
          onEnterTournament={onEnterTournament}
        />
      )}

      {globalTab === "My Tournaments" && (
        <MyTournaments
          tournaments={myTournaments}
          onEnterTournament={onEnterTournament}
        />
      )}

      {globalTab === "Profile" && (
        <ProfilePage userProfile={userProfile} />
      )}

      {globalTab === "Admin Panel" && (
        <AdminPanel
          tournaments={tournaments}
          myUid={user.uid}
          onEnterTournament={onEnterTournament}
        />
      )}
    </GlobalLayout>
  );
}

export default WorkspaceShell;

/* =========================
   APP ROOT
========================= */

export default function App() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setBooting(false);
    });
    return () => unsub();
  }, []);

  const isLoggedIn = useMemo(
    () => !!user && !user.isAnonymous,
    [user]
  );

  if (booting) return <LoadingScreen />;

  // Anonymous → public landing only
  if (!isLoggedIn) {
    return (
      <>
        <PublicLanding onOpenAuth={() => setAuthOpen(true)} />
        {authOpen && <AuthWall onClose={() => setAuthOpen(false)} />}
      </>
    );
  }

  // Logged in → real application
  return (
    <WorkspaceShell
      user={user}
      userProfile={null}
      tournaments={[]}
      activeTournament={null}
      participants={[]}
      matches={[]}
      presence={{}}
    />
  );
}
