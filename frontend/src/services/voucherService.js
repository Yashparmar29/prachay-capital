import api from './api';

export const voucherService = {
  async getVouchers(params = {}) {
    // Filter out empty params
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        cleanParams[key] = params[key];
      }
    });
    const response = await api.get('/vouchers', { params: cleanParams });
    return response.data;
  },

  async getPendingVouchers(params = {}) {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        cleanParams[key] = params[key];
      }
    });
    const response = await api.get('/vouchers/pending', { params: cleanParams });
    return response.data;
  },

  async getVoucherById(id) {
    const response = await api.get(`/vouchers/${id}`);
    return response.data;
  },

  async createVoucher(data) {
    const response = await api.post('/vouchers', data);
    return response.data;
  },

  async updateVoucher(id, data) {
    const response = await api.put(`/vouchers/${id}`, data);
    return response.data;
  },

  async deleteVoucher(id) {
    const response = await api.delete(`/vouchers/${id}`);
    return response.data;
  },

  async uploadSignature(id, file) {
    const formData = new FormData();
    formData.append('signature', file);
    const response = await api.post(`/vouchers/${id}/signature`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async submitVoucher(id) {
    const response = await api.post(`/vouchers/${id}/submit`);
    return response.data;
  },

  async approveVoucher(id, signatureFileOrPath) {
    if (typeof signatureFileOrPath === 'string') {
      const response = await api.post(`/vouchers/${id}/approve`, {
        directorSignaturePath: signatureFileOrPath,
      });
      return response.data;
    }

    const formData = new FormData();
    formData.append('signature', signatureFileOrPath);
    const response = await api.post(`/vouchers/${id}/approve`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async rejectVoucher(id, rejectionReason) {
    const response = await api.post(`/vouchers/${id}/reject`, {
      rejectionReason,
    });
    return response.data;
  },
};
