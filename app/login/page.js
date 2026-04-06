"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Leaf, Mail, Lock, User, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (tab === "register") {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, adminSecret })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      
      setSuccess(`Account created as ${data.role}! Logging you in...`);
      const loginRes = await signIn("credentials", { email, password, redirect: false });
      if (loginRes?.error) { setError(loginRes.error); setLoading(false); return; }
      router.push("/dashboard");
    } else {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) { setError("Invalid email or password. Try registering first."); setLoading(false); return; }
      router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in">
        <div className="login-logo">
          <div className="icon-wrap">
            <Leaf size={32} color="white" />
          </div>
          <h2>Mepco Eco-Hub</h2>
          <p>Sustainability Intelligence Portal</p>
        </div>

        <div className="tab-switcher">
          <button className={`tab-btn ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>
            Login
          </button>
          <button className={`tab-btn ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setError(""); setSuccess(""); }}>
            Register
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {tab === "register" && (
            <div className="form-group">
              <label>Full Name</label>
              <div style={{position: 'relative'}}>
                <User size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)'}} />
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" style={{paddingLeft: '38px'}} placeholder="Your full name" required />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>College Email</label>
            <div style={{position: 'relative'}}>
              <Mail size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)'}} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" style={{paddingLeft: '38px'}} placeholder="student@mepcoeng.ac.in" required />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{position: 'relative'}}>
              <Lock size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)'}} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" style={{paddingLeft: '38px'}} placeholder="Minimum 6 characters" required />
            </div>
          </div>

          {tab === "register" && (
            <div className="form-group">
              <label style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <ShieldCheck size={14} color="var(--accent-purple)" />
                Admin Secret Code <span style={{color: 'var(--text-secondary)', fontWeight: 400}}>(optional)</span>
              </label>
              <input type="password" value={adminSecret} onChange={e => setAdminSecret(e.target.value)} className="input-field" placeholder="Leave blank for student access" />
              <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Get the admin code from your club OB to unlock admin privileges</p>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center', marginTop: '0.5rem'}} disabled={loading}>
            {loading ? "Processing..." : tab === "login" ? "Sign In to Portal" : "Create Account"}
          </button>
        </form>

        <p style={{textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem'}}>
          Only <strong>@mepcoeng.ac.in</strong> emails are allowed
        </p>
      </div>
    </div>
  );
}
