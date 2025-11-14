import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || !storedUser.username) {
      setError("No user found. Please log in again.");
      return;
    }

    const username = storedUser.username;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:8081/api/profile/${username}`);
        setUser(res.data);
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        setError("Failed to load profile data.");
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const { oldPassword, newPassword, confirmNewPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      alert("All fields are required!");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("New password and confirmation do not match!");
      return;
    }

    try {
      const res = await axios.put(`http://localhost:8081/api/change-password/${user.username}`, {
        oldPassword,
        newPassword,
      });

      alert(res.data.message);
      setPasswordData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
      setShowChangePassword(false);
    } catch (err) {
      console.error("❌ Password change error:", err);
      alert(err.response?.data?.message || "Failed to change password");
    }
  };

  if (error) return <p className="profile-error">{error}</p>;
  if (!user) return <p className="profile-loading">Loading profile...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>👤 User Profile</h2>
          <p>Your account details</p>
        </div>

        <div className="profile-details">
          <p><span className="profile-label">Username:</span> {user.username}</p>
          <p><span className="profile-label">First Name:</span> {user.firstName || "—"}</p>
          <p><span className="profile-label">Last Name:</span> {user.lastName || "—"}</p>
          <p><span className="profile-label">Mobile:</span> {user.mobile || "—"}</p>
          <p><span className="profile-label">Address:</span> {user.address || "—"}</p>
          <p><span className="profile-label">Role:</span> {user.role || "—"}</p>
        </div>

        <div className="profile-actions">
          {!showChangePassword && (
            <button className="profile-btn" onClick={() => setShowChangePassword(true)}>
              Change Password
            </button>
          )}

          {showChangePassword && (
            <form className="change-password-form" onSubmit={handlePasswordChange}>
              <input
                type="password"
                name="oldPassword"
                placeholder="Old Password"
                value={passwordData.oldPassword}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="confirmNewPassword"
                placeholder="Confirm New Password"
                value={passwordData.confirmNewPassword}
                onChange={handleChange}
                required
              />
              <div className="form-buttons">
                <button type="submit" className="profile-btn">Update Password</button>
                <button type="button" className="profile-btn cancel-btn" onClick={() => setShowChangePassword(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
