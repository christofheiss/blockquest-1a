// BlockQuest 1A – öffentliche Einstellungen (darf auf GitHub liegen)
// Enthält KEINE Geheimnisse: nur den öffentlichen Schlüssel der Lehrperson und Prüfwerte (Hashes) der gültigen Codes.
// Erzeugt mit setup.html am 10.11.2026, 21:01:38.
export const CONFIG = {
  className: '1A',
  // Online-Speichern: Adresse des Cloudflare Workers (leer = nur Datei-Download) und privates Daten-Repo
  saveUrl: 'https://blockquest-1a-save.c-heiss.workers.dev',
  dataRepo: 'christofheiss/blockquest-1a-daten',
  teacherPublicKey: {"kty":"RSA","n":"z0OlGveCS43tl2Hzap54KF80Gwt75ykUud3oPEpK63NSkx3EWWYfjI7MkcUvrAT6YcNRP9dXBGQz_hqKbM-Jlxst2m8f1R9JCu4RtI8hSEa1K_UP3j5d5qN5qsN5kbg5jQCZNTDVoS4gquONbIyg2Rle01XnvBM-0OwbrofA5soOLseXeNoBRBuGCvDsdw32FfY20Dm1KjCnpFL3UfCTynvebqpxl229cWgPUaHJsACaPh6mpMWTXreJMjUGCeWTh_rMpXva9yyqahvcASOO0kXg1vvrSFwI858e3SLLanMwXc5KZO_CtqIY17hTAHKSW3bZtrM4CGtcbsxPOBvrqw","e":"AQAB","alg":"RSA-OAEP-256","ext":true,"key_ops":["encrypt"]},
  // Freigabe, solange der Worker nichts anderes meldet (te = Terme-Insel LU 10, dd = Daten-Stadt LU 11)
  worlds: { te: true, dd: false },
  tokenHashes: [
    '2b0105c189c8c6d58bee7e33ad15cae7fe0c83494950a6edc4c536150e92724c', // 1A01
    '8b893b8f704e9cc268dcc69c5240eea1ea4f4a875f6981ab5d77823cc4e89eed', // 1A02
    '7c8d6d4f12ef9375a38f630a2b3796a0a2b01789e99cf5b823beeeea28e5e56a', // 1A03
    'bc97c84e5d2c930fdc32029eef75f4f64a1efac4007577a42e78aaea7cb7eb45', // 1A04
    '72f0730446274a3a33e50cf471062bf9d244c25068a14e43f2c3e29df2edabc6', // 1A05
    'b865479700ef0c1f988ab4244eda741afb100e55b905ca7a00a13e0699248a14', // 1A06
    '113636ad6ff9e342a954d18466eb6e4f1fb3a6d177cf9ce5e23f62bae8e741f3', // 1A07
    '785d0ea3937289368f237cf67528f85d2923ce539dd028258e67f6528a5d4afe', // 1A08
    'de74f80f7f687b5b54d023d1881d3a68488c0b02f3043217edd78edc1df792de', // 1A09
    '74fc3c9941444fc3e5c7f183be367a042a47418ce6b4c737d510741e45b1c3a9', // 1A10
    'd06f6ee7813c8504e826b11bcbefa128704cb10a6d207236eb1d25684fd87acb', // 1A11
    'c73e0543401132876ebaf9923270a96ec82466a1e1ad5ebf63797879c0e7c6a5', // 1A12
    'd253d3d78cd152f25e9572d4afd426e71808189d16490b25270196da5ea835a6', // 1A13
    '2e6da3308534035caf44607b1267e563ed9a6c25346e8d9e1cc1d084070b0c19', // 1A14
    '8c828085e967e4304589b45f5b3068b1c20e9d243f4ccc5b023d113fad29c077', // 1A15
    '4afbdaf54655d336c00af313d199e9a9f48884e912eea95712030eeba9494bca', // 1A16
    '1d17b5b11484d914ac91160a7fdbf76405200017568a8db03f66206fd9b05bc9', // 1A99 (Test Lehrperson)
  ]
};
