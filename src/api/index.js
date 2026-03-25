import axios from "axios";

// ── Axios instance ──
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Products API ──
export const productApi = {
  getAll: (params = {}) => api.get("/products", { params }),
  getById: (id)          => api.get(`/products/${id}`),
  create:  (data)        => api.post("/products", data),
  update:  (id, data)    => api.put(`/products/${id}`, data),
  delete:  (id)          => api.delete(`/products/${id}`),
};

// ── Categories API ──
export const categoryApi = {
  getAll: ()      => api.get("/categories"),
  getById: (id)   => api.get(`/categories/${id}`),
  create: (data)  => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id)    => api.delete(`/categories/${id}`),
};

// ── Orders API ──
export const orderApi = {
  create:    (data)        => api.post("/orders", data),
  getById:   (id)          => api.get(`/orders/${id}`),
  getByUser: (firebaseUid) => api.get("/orders/user/list", {
    params: { firebase_uid: firebaseUid }
  }),
};

// ── Reviews API ──
export const reviewApi = {
  getByProduct: (productId)  => api.get(`/reviews/${productId}`),
  create:       (data)       => api.post("/reviews", data),
  check:        (params)     => api.get("/reviews/check", { params }),
};

export default api;