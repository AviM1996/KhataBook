class ResponseService {
  #normalizeData(data) {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && Object.keys(data).length) return data;
    return {};
  }
  
  build(status, message, data, errors) {
    return {
      status,
      message,
      data: this.#normalizeData(data),
      errors: errors ?? [],
    };
  }

  success(data = {}) {
    return this.build(
      true,
      data.message ?? "Request successful",
      data.data,
      data.errors
    );
  }

  error(message, data = {}, errors = []) {
    return this.build(false, message, data, errors);
  }
}

module.exports = new ResponseService();