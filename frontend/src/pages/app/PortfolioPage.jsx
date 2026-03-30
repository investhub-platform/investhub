import { useState, useEffect } from "react";
import AppNavbar from "../../components/layout/AppNavBar";
import { DesktopSidebar } from "../../components/DesktopSidebar";
import api from "../../lib/axios";
import { useAuth } from "../../features/auth/useAuth";

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [newPortfolio, setNewPortfolio] = useState({
    name: "",
    description: "",
    category: "Startup",
    riskLevel: "Medium",
    visibility: "Private"
  });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "Startup",
    riskLevel: "Medium",
    visibility: "Private"
  });

  const { fetchMe } = useAuth();

  const fetchPortfolios = async () => {
    try {
      const res = await api.get("/v1/portfolios");
      setPortfolios(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load portfolios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const me = await fetchMe();
        console.log("Fetched user data:", me);
        if (me || me.data) {
          setUserProfile(me);
        } else {
          setError("Failed to load user data here");
        }
      } catch (err) {
        setError("Failed to load user data", err);
      }
    };

    loadUserData();
    fetchPortfolios();
  }, []);

  const handleCreatePortfolio = async (e) => {
    e.preventDefault();
    if (!newPortfolio.name.trim()) return;

    setCreating(true);
    try {
      await api.post("/v1/portfolios", newPortfolio);
      setNewPortfolio({
        name: "",
        description: "",
        category: "Startup",
        riskLevel: "Medium",
        visibility: "Private"
      });
      setShowCreateForm(false);
      await fetchPortfolios();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create portfolio");
    } finally {
      setCreating(false);
    }
  };

  const handleEditPortfolio = (portfolio) => {
    setEditingId(portfolio._id);
    setEditForm({
      name: portfolio.name,
      description: portfolio.description || "",
      category: portfolio.category || "Startup",
      riskLevel: portfolio.riskLevel || "Medium",
      visibility: portfolio.visibility || "Private"
    });
  };

  const handleUpdatePortfolio = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;

    try {
      await api.put(`/v1/portfolios/${editingId}`, editForm);
      setEditingId(null);
      setEditForm({
        name: "",
        description: "",
        category: "Startup",
        riskLevel: "Medium",
        visibility: "Private"
      });
      await fetchPortfolios();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update portfolio");
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (!confirm("Are you sure you want to delete this portfolio?")) return;

    try {
      await api.delete(`/v1/portfolios/${id}`);
      await fetchPortfolios();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete portfolio");
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case "Low":
        return "text-green-600 bg-green-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "High":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getVisibilityBadge = (visibility) => {
    return visibility === "Public"
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <DesktopSidebar />
        <main className="flex-1 w-full">
          <AppNavbar />
          <div className="max-w-5xl mx-auto px-6 pt-28 pb-10 w-full">
            <h1 className="text-3xl heading-tight">Portfolio</h1>
            <p className="text-muted-foreground mt-1">
              Track your active investments and performance.
            </p>
            <div className="mt-8 obsidian-card p-6">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <DesktopSidebar />
        <main className="flex-1 w-full">
          <AppNavbar />
          <div className="max-w-5xl mx-auto px-6 pt-28 pb-10 w-full">
            <h1 className="text-3xl heading-tight">Portfolio</h1>
            <p className="text-muted-foreground mt-1">
              Track your active investments and performance.
            </p>
            <div className="mt-8 obsidian-card p-6">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <DesktopSidebar />
      <main className="flex-1 w-full">
        <AppNavbar />
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-10 w-full">
          {/* User Profile Section */}
          {userProfile && (
            <div className="mb-6 obsidian-card p-6 bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Profile Picture */}
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                    {userProfile.profile?.profilePictureUrl ? (
                      <img
                        src={userProfile.profile.profilePictureUrl}
                        alt={userProfile.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-primary">
                        {userProfile.name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div>
                    <h2 className="text-xl font-semibold">
                      {userProfile.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {userProfile.email}
                    </p>
                    {userProfile.profile?.bio && (
                      <p className="text-sm mt-1">{userProfile.profile.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {userProfile.profile?.expertise && (
                        <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                          {userProfile.profile.expertise}
                        </span>
                      )}
                      {userProfile.roles?.map((role, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Portfolio Stats */}
                <div className="flex gap-4 md:gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {portfolios.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Portfolios</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {portfolios
                        .reduce((total, p) => total + (p.totalInvested || 0), 0)
                        .toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total Invested (LKR)
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                {userProfile.profile?.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{userProfile.profile.location}</span>
                  </div>
                )}
                {userProfile.profile?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span>{userProfile.profile.phone}</span>
                  </div>
                )}
                {userProfile.profile?.nic && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>
                    <span>NIC: {userProfile.profile.nic}</span>
                  </div>
                )}
                {userProfile.profile?.linkedin && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m3.172-3.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102"
                      />
                    </svg>
                    <a
                      href={userProfile.profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {userProfile.preferences && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <span>
                      Notifications:{" "}
                      {userProfile.preferences.notificationEmail
                        ? "Email & "
                        : ""}
                      {userProfile.preferences.notificationInApp
                        ? "In-App"
                        : "Disabled"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl heading-tight">Portfolio</h1>
              <p className="text-muted-foreground mt-1">
                Track your active investments and performance.
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              {showCreateForm ? "Cancel" : "Create Portfolio"}
            </button>
          </div>

          {showCreateForm && (
            <div className="mt-8 obsidian-card p-6">
              <h2 className="text-xl font-semibold mb-4">
                Create New Portfolio
              </h2>
              <form onSubmit={handleCreatePortfolio}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newPortfolio.name}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          name: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      value={newPortfolio.description}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          description: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <select
                      value={newPortfolio.category}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          category: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Startup">Startup</option>
                      <option value="Stocks">Stocks</option>
                      <option value="Crypto">Crypto</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Risk Level
                    </label>
                    <select
                      value={newPortfolio.riskLevel}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          riskLevel: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Visibility
                    </label>
                    <select
                      value={newPortfolio.visibility}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          visibility: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Private">Private</option>
                      <option value="Public">Public</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create Portfolio"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {portfolios.length === 0 ? (
            <div className="mt-8 obsidian-card p-6">
              <p className="text-sm text-muted-foreground">
                No portfolios found. Create your first portfolio to start
                tracking investments.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {portfolios.map((portfolio) => (
                <div key={portfolio._id} className="obsidian-card p-6">
                  {editingId === portfolio._id ? (
                    <form onSubmit={handleUpdatePortfolio}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Description (optional)
                          </label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value
                              })
                            }
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Category
                          </label>
                          <select
                            value={editForm.category}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                category: e.target.value
                              })
                            }
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="Startup">Startup</option>
                            <option value="Stocks">Stocks</option>
                            <option value="Crypto">Crypto</option>
                            <option value="Mixed">Mixed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Risk Level
                          </label>
                          <select
                            value={editForm.riskLevel}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                riskLevel: e.target.value
                              })
                            }
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Visibility
                          </label>
                          <select
                            value={editForm.visibility}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                visibility: e.target.value
                              })
                            }
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="Private">Private</option>
                            <option value="Public">Public</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/90"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-semibold">
                              {portfolio.name}
                            </h2>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getRiskLevelColor(portfolio.riskLevel)}`}
                            >
                              {portfolio.riskLevel} Risk
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getVisibilityBadge(portfolio.visibility)}`}
                            >
                              {portfolio.visibility}
                            </span>
                          </div>
                          {portfolio.description && (
                            <p className="text-muted-foreground mt-1">
                              {portfolio.description}
                            </p>
                          )}
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Category: {portfolio.category}</span>
                            <span>Status: {portfolio.status}</span>
                            {portfolio.isFavorite && <span>⭐ Favorite</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPortfolio(portfolio)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePortfolio(portfolio._id)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Total Invested
                          </p>
                          <p className="text-lg font-semibold">
                            LKR {portfolio.totalInvested?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Total Returns
                          </p>
                          <p className="text-lg font-semibold">
                            LKR {portfolio.totalReturns?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Profit/Loss
                          </p>
                          <p
                            className={`text-lg font-semibold ${portfolio.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            LKR {portfolio.profitLoss?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">ROI</p>
                          <p
                            className={`text-lg font-semibold ${portfolio.roiPercentage >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {portfolio.roiPercentage?.toFixed(2) || 0}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-lg font-medium">Investments</h3>
                        {portfolio.investments?.length === 0 ? (
                          <p className="text-sm text-muted-foreground mt-2">
                            No investments yet.
                          </p>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {portfolio.investments?.map((investment, index) => {
                              const startupOwner = investment.startupId?.UserID;
                              const startupOwnerLabel =
                                startupOwner?.name ||
                                startupOwner?.email ||
                                startupOwner?._id ||
                                "Unknown Owner";

                              return (
                                <div
                                  key={index}
                                  className="flex justify-between items-center p-3 bg-muted rounded"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {investment.startupId?.name ||
                                        "Unknown Startup"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Startup Owner: {startupOwnerLabel}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Invested: LKR{" "}
                                      {investment.amountInvested?.toLocaleString() ||
                                        0}{" "}
                                      on{" "}
                                      {investment.investedAt
                                        ? new Date(
                                            investment.investedAt
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm">
                                      Shares: {investment.shares || 0}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Last Updated:{" "}
                          {portfolio.lastUpdated
                            ? new Date(
                                portfolio.lastUpdated
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
