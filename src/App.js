import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { supabase } from "./supabase";
import Login from "./Login";
import Landing from "./Landing";

const CATS = [
  { id: "restaurant", label: "Restaurants", emoji: "🍽️", color: "#E24B4A" },
  { id: "cafe",       label: "Cafes",        emoji: "☕",  color: "#BA7517" },
  { id: "fastfood",   label: "Fast Food",    emoji: "🍔", color: "#3B6D11" },
  { id: "halal",      label: "Halal",        emoji: "🌙", color: "#185FA5" },
  { id: "vegan",      label: "Vegan/Veg",    emoji: "🥦", color: "#1D9E75" },
  { id: "bubble",     label: "Bubble Tea",   emoji: "🧋", color: "#993556" },
];

const CAMPUS = [[43.6680,-79.4050],[43.6680,-79.3900],[43.6560,-79.3900],[43.6560,-79.4050]];
const WORLD  = [[-90,-180],[-90,180],[90,180],[90,-180]];
const BOUNDARY = { north:43.6680, south:43.6560, west:-79.4050, east:-79.3900 };
const UOFT_CENTER = [43.6629, -79.3957];
const EMPTY_FORM = { group_name:"", description:"", price:"", building:"", category:"restaurant", available_time:"", lat:null, lng:null };

function isWithinCampus(lat, lng) {
  return lat<=BOUNDARY.north && lat>=BOUNDARY.south && lng>=BOUNDARY.west && lng<=BOUNDARY.east;
}

function makeIcon(cat, active) {
  const size = active ? 42 : 34;
  return L.divIcon({
    className:"",
    html:`<div style="width:${size}px;height:${size}px;border-radius:50%;background:${cat.color};border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:${active?19:16}px;box-shadow:0 2px 10px rgba(0,0,0,0.25);">${cat.emoji}</div>`,
    iconSize:[size,size], iconAnchor:[size/2,size/2], popupAnchor:[0,-size/2-4],
  });
}

function FlyTo({ place }) {
  const map = useMap();
  if (place) map.flyTo([place.lat, place.lng], 17, { duration:1 });
  return null;
}

function LocationPicker({ pickingRef, onPick }) {
  const map = useMap();
  useEffect(() => {
    const c = map.getContainer();
    c.style.cursor = pickingRef.current ? "crosshair" : "";
    return () => { c.style.cursor = ""; };
  });
  useMapEvents({ click(e) { onPick(e.latlng); } });
  return null;
}

// Works on both desktop (hover) and mobile (tap)
function SmartMarker({ p, cat, isActive, onSelect }) {
  const markerRef = useRef(null);
  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
  return (
    <Marker
      ref={markerRef}
      position={[p.lat, p.lng]}
      icon={makeIcon(cat, isActive)}
      eventHandlers={{
        mouseover() { if (!isMobile()) markerRef.current?.openPopup(); },
        mouseout()  { if (!isMobile()) markerRef.current?.closePopup(); },
        click()     { onSelect(p); if (isMobile()) markerRef.current?.openPopup(); },
      }}
    >
      <Popup closeButton={true} autoPan={false}>
        <strong style={{fontSize:14}}>{p.group_name}</strong><br/>
        <span style={{color:"#555",fontSize:12}}>{p.description}</span><br/>
        <span style={{color:"#ff6b6b",fontSize:13,fontWeight:600}}>{p.price}</span><br/>
        <span style={{color:"#aaa",fontSize:11}}>📍 {p.building}</span><br/>
        <span style={{color:"#888",fontSize:11}}>🕐 {p.available_time}</span>
      </Popup>
    </Marker>
  );
}

export default function App() {
  const [page, setPage] = useState('landing'); // 'landing' | 'map' | 'login'
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);
  const [showListingModal, setShowListingModal] = useState(false);
  const [pickingLocation, setPickingLocation] = useState(false);
  const [boundaryError, setBoundaryError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showMobileList, setShowMobileList] = useState(false);
  const pickingRef = useRef(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formMsg, setFormMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setPage('map');
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadListings() {
    const { data, error } = await supabase.from("listings").select("*").eq("visible", true).order("created_at", { ascending:false });
    if (error) console.error(error);
    else setListings(data);
    setLoading(false);
  }
  useEffect(() => { loadListings(); }, []);

  const catFor = (id) => CATS.find(c => c.id === id) || CATS[0];
  const visible = listings.filter(p => {
    const cm = activeFilters.size === 0 || activeFilters.has(p.category);
    const q = search.toLowerCase();
    return cm && (!q || p.group_name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.building||"").toLowerCase().includes(q));
  });

  const toggleFilter = (id) => setActiveFilters(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  const handleSignOut = async () => { await supabase.auth.signOut(); setUser(null); };
  const openNewListing = () => { setEditingId(null); setForm(EMPTY_FORM); setFormMsg(""); setBoundaryError(""); setShowListingModal(true); };
  const openEditListing = (p) => { setEditingId(p.id); setForm({ group_name:p.group_name, description:p.description, price:p.price==="Free"?"":p.price, building:p.building, category:p.category, available_time:p.available_time, lat:p.lat, lng:p.lng }); setFormMsg(""); setBoundaryError(""); setShowListingModal(true); };
  const startPicking = () => { pickingRef.current=true; setPickingLocation(true); setShowListingModal(false); setBoundaryError(""); };
  const cancelPicking = () => { pickingRef.current=false; setPickingLocation(false); setShowListingModal(true); };

  const handleMapPick = (latlng) => {
    if (!pickingRef.current) return;
    setBoundaryError("");
    if (!isWithinCampus(latlng.lat, latlng.lng)) {
      setBoundaryError("📍 That location is outside UofT St. George campus.");
      setShowListingModal(true); pickingRef.current=false; setPickingLocation(false); return;
    }
    setForm(f=>({...f, lat:latlng.lat, lng:latlng.lng}));
    pickingRef.current=false; setPickingLocation(false); setShowListingModal(true);
  };

  const handleSubmit = async () => {
    if (!form.group_name.trim()) { setFormMsg("Please enter your group name."); return; }
    if (!form.description.trim()) { setFormMsg("Please describe what you're offering."); return; }
    if (!form.building.trim()) { setFormMsg("Please enter your building/location."); return; }
    if (!form.available_time.trim()) { setFormMsg("Please enter your available time."); return; }
    if (!form.lat || !form.lng) { setFormMsg("Please pick your location on the map."); return; }
    setSubmitting(true);
    const payload = { group_name:form.group_name.trim(), description:form.description.trim(), price:form.price.trim()||"Free", building:form.building.trim(), category:form.category, available_time:form.available_time.trim(), lat:form.lat, lng:form.lng, visible:true };
    let error;
    if (editingId) { ({error} = await supabase.from("listings").update(payload).eq("id",editingId).eq("user_id",user.id)); }
    else { ({error} = await supabase.from("listings").insert({...payload, user_id:user.id})); }
    setSubmitting(false);
    if (error) { setFormMsg("Error saving listing. Please try again."); }
    else { setFormMsg(editingId?"✓ Listing updated!":"✓ Listing added to the map!"); loadListings(); setTimeout(()=>{ setShowListingModal(false); setFormMsg(""); setEditingId(null); }, 1500); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    await supabase.from("listings").delete().eq("id",id).eq("user_id",user.id);
    setShowListingModal(false); setEditingId(null); loadListings();
  };

  // ── PAGES ──
  if (page === 'landing') return <Landing onEnterMap={() => setPage('map')} />;
  if (page === 'login') return <Login />;

  return (
    <div className="app">
      <header className="header">
        <div className="logo" onClick={() => setPage('landing')} style={{cursor:'pointer'}}>UofT<span>Eats</span></div>
        <input className="search" type="text" placeholder="Search food, buildings..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {user ? (
            <>
              <button className="auth-btn apply" onClick={openNewListing}>+ Add</button>
              <button className="auth-btn" onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <button className="auth-btn" onClick={() => setPage('login')}>Sign in</button>
          )}
        </div>
      </header>

      <div className="main">
        <aside className="sidebar">
          <div className="res-header">{loading?"Loading...":`${visible.length} active listings`}</div>
          <div className="place-list">
            {loading ? <div className="loading-msg">Loading listings...</div>
              : visible.length===0 ? <div className="loading-msg">No listings yet. Be the first!</div>
              : visible.map(p => {
                const cat = catFor(p.category);
                const isOwner = user?.id===p.user_id;
                return (
                  <div key={p.id} className={`place-item ${selected?.id===p.id?"active":""}`}
                    onClick={() => setSelected(selected?.id===p.id?null:p)}>
                    <div className="place-ico" style={{background:cat.color+"22"}}>{cat.emoji}</div>
                    <div className="place-info">
                      <div className="place-name">{p.group_name}{isOwner&&<button className="edit-btn" onClick={e=>{e.stopPropagation();openEditListing(p);}}>✏️</button>}</div>
                      <div className="place-sub">{p.description}</div>
                      <div className="place-building">📍 {p.building} · {p.available_time}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </aside>

        <div className="map-wrap">
          {pickingLocation && (
            <div className="pick-banner">📍 Click on campus to place your pin<button onClick={cancelPicking}>Cancel</button></div>
          )}
          <MapContainer center={UOFT_CENTER} zoom={16} style={{width:"100%",height:"100%"}}>
            <TileLayer attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <FlyTo place={selected}/>
            <LocationPicker pickingRef={pickingRef} onPick={handleMapPick}/>
            <Polygon positions={[WORLD,CAMPUS]} pathOptions={{fillColor:"#1a1a1a",fillOpacity:0.3,stroke:false}}/>
            <Polygon positions={CAMPUS} pathOptions={{color:"#ff6b6b",weight:2,fillOpacity:0,dashArray:"6 4"}}/>
            {form.lat&&form.lng&&(
              <Marker position={[form.lat,form.lng]} icon={L.divIcon({className:"",html:`<div style="width:36px;height:36px;border-radius:50%;background:#ff6b6b;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 10px rgba(0,0,0,0.3);">📍</div>`,iconSize:[36,36],iconAnchor:[18,18]})}>
                <Popup>Your listing will appear here</Popup>
              </Marker>
            )}
            {visible.map(p => <SmartMarker key={p.id} p={p} cat={catFor(p.category)} isActive={selected?.id===p.id} onSelect={p=>setSelected(selected?.id===p.id?null:p)}/>)}
          </MapContainer>

          <div className="filter-bar">
            <span className="filter-lbl">Filters</span>
            {CATS.map(c=>(
              <button key={c.id} className={`fp ${activeFilters.has(c.id)?"on":""}`}
                style={activeFilters.has(c.id)?{background:c.color,borderColor:c.color}:{}}
                onClick={()=>toggleFilter(c.id)}>
                {c.emoji}<span className="fp-label"> {c.label}</span>
              </button>
            ))}
          </div>

          <button className="mobile-list-btn" onClick={()=>setShowMobileList(!showMobileList)}>
            {showMobileList?"🗺 View Map":`📋 ${visible.length} Listings`}
          </button>
        </div>
      </div>

      {showMobileList&&(
        <div className="mobile-drawer">
          <div className="mobile-drawer-header">
            <span>{visible.length} active listings</span>
            <button onClick={()=>setShowMobileList(false)}>✕</button>
          </div>
          <div className="place-list">
            {visible.length===0?<div className="loading-msg">No listings yet!</div>
              :visible.map(p=>{
                const cat=catFor(p.category);
                const isOwner=user?.id===p.user_id;
                return(
                  <div key={p.id} className={`place-item ${selected?.id===p.id?"active":""}`}
                    onClick={()=>{setSelected(selected?.id===p.id?null:p);setShowMobileList(false);}}>
                    <div className="place-ico" style={{background:cat.color+"22"}}>{cat.emoji}</div>
                    <div className="place-info">
                      <div className="place-name">{p.group_name}{isOwner&&<button className="edit-btn" onClick={e=>{e.stopPropagation();openEditListing(p);}}>✏️</button>}</div>
                      <div className="place-sub">{p.description}</div>
                      <div className="place-building">📍 {p.building} · {p.available_time}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {showListingModal&&(
        <div className="modal-overlay" onClick={()=>setShowListingModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2>{editingId?"Edit Listing":"Add a Food Listing"}</h2>
            <p>Tell students what you're selling, where, and when.</p>
            <div className="form-row"><label>Group Name *</label><input type="text" placeholder="e.g. UofT Engineering Society" value={form.group_name} onChange={e=>setForm(f=>({...f,group_name:e.target.value}))}/></div>
            <div className="form-row"><label>What are you offering? *</label><input type="text" placeholder="e.g. Jerk chicken plates, bake sale" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <div className="form-row"><label>Price (leave blank for Free)</label><input type="text" placeholder="e.g. $12, Pay what you can" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))}/></div>
            <div className="form-row"><label>Category *</label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATS.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}</select></div>
            <div className="form-row"><label>Building / Location *</label><input type="text" placeholder="e.g. Bahen Centre, front entrance" value={form.building} onChange={e=>setForm(f=>({...f,building:e.target.value}))}/></div>
            <div className="form-row"><label>Available Time *</label><input type="text" placeholder="e.g. Today 11am - 2pm" value={form.available_time} onChange={e=>setForm(f=>({...f,available_time:e.target.value}))}/></div>
            <div className="form-row"><label>Pin Location on Map *</label>
              {form.lat&&form.lng?(
                <div style={{fontSize:12,color:"#1D9E75",marginBottom:6}}>✓ Location set — {Number(form.lat).toFixed(4)}, {Number(form.lng).toFixed(4)}
                  <button onClick={()=>setForm(f=>({...f,lat:null,lng:null}))} style={{marginLeft:8,fontSize:11,color:"#aaa",background:"none",border:"none",cursor:"pointer"}}>Change</button>
                </div>
              ):(
                <button className="pick-btn" onClick={startPicking}>📍 Click map to pick location</button>
              )}
              {boundaryError&&<p style={{color:"#E24B4A",fontSize:12,marginTop:6}}>{boundaryError}</p>}
            </div>
            {formMsg&&<p className="apply-msg" style={{color:formMsg.startsWith("✓")?"#1D9E75":"#E24B4A"}}>{formMsg}</p>}
            <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>{submitting?"Saving...":editingId?"Save Changes":"Add to Map"}</button>
            {editingId&&<button className="delete-btn" onClick={()=>handleDelete(editingId)}>🗑 Delete Listing</button>}
            <button className="cancel-btn" onClick={()=>{setShowListingModal(false);setEditingId(null);}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
