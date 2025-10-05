import React, { useState, useEffect } from "react";
import Layout from '../../components/Layout';
import AdminMenu from '../../components/AdminMenu';
import axios from "axios";
import { toast } from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get all users
  const getAllUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/v1/auth/all-users");
      setLoading(false);
      if (data?.success) {
        setUsers(data.users);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Something went wrong in getting users");
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <Layout title={"Dashboard - All Users"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1 className="text-center mb-4">All Users</h1>
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Address</th>
                      <th scope="col">Role</th>
                      <th scope="col">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.length > 0 ? (
                      users.map((user, index) => (
                        <tr key={user._id}>
                          <td>{index + 1}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.phone}</td>
                          <td>{user.address}</td>
                          <td>
                            <span
                              className={`badge ${
                                user.role === 1
                                  ? "bg-success"
                                  : "bg-primary"
                              }`}
                            >
                              {user.role === 1
                                ? "Admin"
                                : "User"}
                            </span>
                          </td>
                          <td>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Users;