import handler from '../api/career-evaluate';

const req = {
  method: 'POST',
  body: { jobTextOrUrl: "Test offre" }
};

const res = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log('RESPONSE STATUS:', this.statusCode);
    console.log('RESPONSE DATA:', data);
  },
  send: function(data) {
    console.log('RESPONSE STATUS:', this.statusCode);
    console.log('RESPONSE DATA:', data);
  }
};

handler(req as any, res as any).catch(err => {
  console.error("UNCAUGHT ERROR:", err);
});
