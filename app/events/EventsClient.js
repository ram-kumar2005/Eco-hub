"use client";

import { useState, useTransition } from "react";
import { Calendar, MapPin, Users, TreePine, Plus, Clock, CheckCircle, X, Leaf } from "lucide-react";
import { rsvpEvent, cancelRSVP, createEvent } from "./actions";

const CATEGORY_STYLES = {
  plantation: { label:"🌳 Plantation",  color:"#16a34a", bg:"rgba(22,163,74,0.1)" },
  cleanup:    { label:"🧹 Clean-Up",    color:"#0891b2", bg:"rgba(8,145,178,0.1)" },
  awareness:  { label:"📣 Awareness",   color:"#7c3aed", bg:"rgba(124,58,237,0.1)" },
  novehicle:  { label:"🚲 No Vehicle",  color:"#ea580c", bg:"rgba(234,88,12,0.1)" },
  general:    { label:"🌿 General",     color:"#16a34a", bg:"rgba(22,163,74,0.1)" },
};

function EventCard({ event, userId, isAdmin }) {
  const [isPending, startTransition] = useTransition();
  const [localHasRSVP, setLocalHasRSVP] = useState(event.hasRSVPd);
  const [localCount, setLocalCount] = useState(event.rsvpCount);
  const [msg, setMsg] = useState(null);

  const cat = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.general;
  const eventDate = new Date(event.eventDate);
  const isPast = eventDate < new Date();
  const daysUntil = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));

  function handleRSVP() {
    startTransition(async () => {
      if (localHasRSVP) {
        const res = await cancelRSVP(event.id);
        if (res.success) { setLocalHasRSVP(false); setLocalCount(c => c - 1); }
      } else {
        const res = await rsvpEvent(event.id);
        if (res.success) { setLocalHasRSVP(true); setLocalCount(c => c + 1); }
        else setMsg(res.error);
      }
    });
  }

  return (
    <div className="card" style={{ borderLeft:`4px solid ${cat.color}`, transition:"transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.08)"}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.8rem", flexWrap:"wrap", gap:"0.5rem" }}>
        <h3 style={{ fontSize:"1.05rem", fontFamily:"Space Grotesk" }}>{event.title}</h3>
        <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
          <span style={{ background:cat.bg, color:cat.color, padding:"3px 10px", borderRadius:"20px", fontSize:"0.75rem", fontWeight:700 }}>{cat.label}</span>
          {isPast && <span style={{ background:"rgba(100,116,139,0.1)", color:"#64748b", padding:"3px 8px", borderRadius:"20px", fontSize:"0.72rem", fontWeight:600 }}>Completed</span>}
          {!isPast && daysUntil <= 7 && <span style={{ background:"rgba(239,68,68,0.1)", color:"#ef4444", padding:"3px 8px", borderRadius:"20px", fontSize:"0.72rem", fontWeight:600 }}>In {daysUntil}d</span>}
        </div>
      </div>

      <p style={{ color:"var(--text-secondary)", fontSize:"0.85rem", marginBottom:"1rem", lineHeight:"1.5" }}>{event.description}</p>

      <div style={{ display:"flex", flexWrap:"wrap", gap:"1rem", fontSize:"0.82rem", color:"var(--text-secondary)", marginBottom:"1rem" }}>
        <span style={{ display:"flex", alignItems:"center", gap:"5px" }}>
          <Calendar size={14} /> {eventDate.toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", year:"numeric" })}
        </span>
        {event.location && <span style={{ display:"flex", alignItems:"center", gap:"5px" }}><MapPin size={14} />{event.location}</span>}
        <span style={{ display:"flex", alignItems:"center", gap:"5px" }}><Users size={14} />{localCount} attending</span>
        {!isPast && <span style={{ display:"flex", alignItems:"center", gap:"5px" }}><Clock size={14} />{daysUntil > 0 ? `${daysUntil} days away` : "Today!"}</span>}
      </div>

      {event.impactMetric && (
        <div style={{ background:"rgba(22,163,74,0.06)", border:"1px solid rgba(22,163,74,0.15)", borderRadius:"8px", padding:"0.6rem 0.8rem", marginBottom:"1rem", fontSize:"0.8rem", color:"#15803d", display:"flex", alignItems:"center", gap:"6px" }}>
          <Leaf size={14} /> <strong>Impact:</strong> {event.impactMetric}
        </div>
      )}

      {msg && <div className="alert alert-error" style={{ marginBottom:"0.8rem", fontSize:"0.8rem" }}>{msg}</div>}

      {!isPast && (
        <button onClick={handleRSVP} disabled={isPending}
          className={localHasRSVP ? "btn-secondary" : "btn-primary"}
          style={{ fontSize:"0.85rem", padding:"0.6rem 1.2rem" }}>
          {isPending ? "..." : localHasRSVP ? <><X size={14} /> Cancel RSVP</> : <><CheckCircle size={14} /> RSVP Now</>}
        </button>
      )}
    </div>
  );
}

export default function EventsClient({ session, events }) {
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState(null);
  const isAdmin = session?.user?.role === "ADMIN";

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [impact, setImpact] = useState("");
  const [category, setCategory] = useState("general");

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true); setCreateMsg(null);
    const fd = new FormData();
    fd.append("title", title); fd.append("description", description);
    fd.append("eventDate", eventDate); fd.append("location", location);
    fd.append("impactMetric", impact); fd.append("category", category);
    const res = await createEvent(fd);
    setCreating(false);
    if (res.success) { setShowCreate(false); setTitle(""); setDescription(""); window.location.reload(); }
    else setCreateMsg(res.error);
  }

  const upcoming = events.filter(e => new Date(e.eventDate) >= new Date());
  const past = events.filter(e => new Date(e.eventDate) < new Date());

  return (
    <main className="main-content animate-fade-in">
      <div className="page-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 className="page-title">Events & Campaigns</h1>
          <p className="page-subtitle">Eco-Club sustainability events — RSVP and track impact</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(v => !v)} className="btn-primary">
            <Plus size={16} /> {showCreate ? "Cancel" : "Create Event"}
          </button>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"1rem", marginBottom:"1.5rem" }} className="delay-1 animate-fade-in">
        <div className="stat-card">
          <div className="stat-icon" style={{ background:"rgba(22,163,74,0.1)" }}><Calendar size={18} color="#16a34a" /></div>
          <div className="stat-label">Upcoming Events</div>
          <div className="stat-value text-gradient">{upcoming.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:"rgba(8,145,178,0.1)" }}><Users size={18} color="#0891b2" /></div>
          <div className="stat-label">Total RSVPs</div>
          <div className="stat-value" style={{ color:"#0891b2" }}>{events.reduce((a,e)=>a+e.rsvpCount,0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:"rgba(22,163,74,0.1)" }}><TreePine size={18} color="#16a34a" /></div>
          <div className="stat-label">Plantation Events</div>
          <div className="stat-value" style={{ color:"#16a34a" }}>{events.filter(e=>e.category==="plantation").length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:"rgba(124,58,237,0.1)" }}><CheckCircle size={18} color="#7c3aed" /></div>
          <div className="stat-label">Your RSVPs</div>
          <div className="stat-value" style={{ color:"#7c3aed" }}>{events.filter(e=>e.hasRSVPd).length}</div>
        </div>
      </div>

      {/* Create Event Form */}
      {showCreate && isAdmin && (
        <form onSubmit={handleCreate} className="form-section delay-2 animate-fade-in" style={{ marginBottom:"1.5rem", borderLeft:"4px solid #16a34a" }}>
          <h3 style={{ marginBottom:"1.2rem", display:"flex", alignItems:"center", gap:"8px" }}><Plus size={16} color="#16a34a" /> New Sustainability Event</h3>
          {createMsg && <div className="alert alert-error" style={{ marginBottom:"1rem" }}>{createMsg}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label>Event Title *</label>
              <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="input-field" placeholder="e.g. Tree Plantation Drive" required />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select value={category} onChange={e=>setCategory(e.target.value)} className="input-field">
                <option value="plantation">🌳 Plantation Drive</option>
                <option value="cleanup">🧹 Clean-Up Campaign</option>
                <option value="awareness">📣 Awareness Drive</option>
                <option value="novehicle">🚲 No Vehicle Day</option>
                <option value="general">🌿 General</option>
              </select>
            </div>
            <div className="form-group">
              <label>Event Date & Time *</label>
              <input type="datetime-local" value={eventDate} onChange={e=>setEventDate(e.target.value)} className="input-field" required />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" value={location} onChange={e=>setLocation(e.target.value)} className="input-field" placeholder="e.g. Ground, Near Library" />
            </div>
            <div className="form-group">
              <label>Impact Metric</label>
              <input type="text" value={impact} onChange={e=>setImpact(e.target.value)} className="input-field" placeholder="e.g. 100 trees = 2100 kg CO₂ offset/yr" />
            </div>
            <div className="form-group" style={{ gridColumn:"1/-1" }}>
              <label>Description *</label>
              <textarea value={description} onChange={e=>setDescription(e.target.value)} className="input-field" placeholder="Describe the event and how students can participate..." rows={3} required />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={creating} style={{ marginTop:"1rem" }}>
            <Calendar size={16} /> {creating ? "Creating..." : "Create Event"}
          </button>
        </form>
      )}

      {/* Upcoming Events */}
      {upcoming.length > 0 && (
        <div className="delay-2 animate-fade-in" style={{ marginBottom:"2rem" }}>
          <h2 style={{ fontSize:"1.1rem", marginBottom:"1rem", display:"flex", alignItems:"center", gap:"8px", color:"var(--text-secondary)", fontWeight:600 }}>
            <Calendar size={16} /> Upcoming Events ({upcoming.length})
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(400px,1fr))", gap:"1rem" }}>
            {upcoming.map(e => <EventCard key={e.id} event={e} userId={session?.user?.id} isAdmin={isAdmin} />)}
          </div>
        </div>
      )}

      {/* Past Events */}
      {past.length > 0 && (
        <div className="delay-3 animate-fade-in">
          <h2 style={{ fontSize:"1rem", marginBottom:"1rem", color:"var(--text-secondary)", fontWeight:600 }}>
            Past Events ({past.length})
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(380px,1fr))", gap:"1rem", opacity:0.7 }}>
            {past.map(e => <EventCard key={e.id} event={e} userId={session?.user?.id} isAdmin={isAdmin} />)}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="card" style={{ textAlign:"center", padding:"4rem 2rem", color:"var(--text-secondary)" }}>
          <Calendar size={48} style={{ margin:"0 auto 1rem", opacity:0.3 }} />
          <p style={{ fontSize:"1.1rem", fontWeight:600 }}>No events yet</p>
          <p style={{ fontSize:"0.85rem", marginTop:"0.5rem" }}>
            {isAdmin ? "Create your first sustainability event using the button above." : "Check back soon — the Eco-Club will post events here."}
          </p>
        </div>
      )}
    </main>
  );
}
