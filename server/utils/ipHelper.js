// IP adresini almak için yardımcı fonksiyon
function getClientIp(req) {
  // X-Forwarded-For header'ından IP al (proxy/load balancer arkasında)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // Birden fazla IP varsa ilkini al
    const ips = forwarded.split(',');
    return ips[0].trim();
  }
  
  // X-Real-IP header'ından IP al
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }
  
  // req.ip kullan (trust proxy ayarlıysa)
  if (req.ip) {
    return req.ip;
  }
  
  // Son çare: connection'dan al
  if (req.connection && req.connection.remoteAddress) {
    return req.connection.remoteAddress;
  }
  
  // Socket'ten al
  if (req.socket && req.socket.remoteAddress) {
    return req.socket.remoteAddress;
  }
  
  return 'unknown';
}

module.exports = { getClientIp };

