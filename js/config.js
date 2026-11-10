// BlockQuest 1A – öffentliche Einstellungen (darf auf GitHub liegen)
// Enthält KEINE Geheimnisse: nur den öffentlichen Schlüssel der Lehrperson und Prüfwerte (Hashes) der gültigen Codes.
// ACHTUNG: TEST-SET aus der Entwicklung (Dongle nicht aufbewahrt). Vor dem Einsatz mit setup.html ersetzen.
export const CONFIG = {
  className: '1A',
  // Online-Speichern: Adresse des Cloudflare Workers (leer = nur Datei-Download) und privates Daten-Repo
  saveUrl: '',
  dataRepo: 'christofheiss/blockquest-1a-daten',
  teacherPublicKey: {"kty":"RSA","n":"omFMwcifDkcOcdM-jcwldvkl8wgWVrIimJXKMK-oJ1nzTJ-OtIkAROB2nTl2e2rIfuD-F53H73KPux7QWrn0V19uT6U7ultWpKdqTc0whSdCgELrqyGIC3tBzLNQ39OCX1rBGFhQzMeQWHAO7KjNU-uJf6O8k0JSXE5UR8mq9_-MLPkUUCtuqeFLCFdLDUoBGA3L4y1Do6kiR1AX46xb_HqiSNttBLssQtistQ94V2D6WfbGoxCGYqF8epIz9XOapB7uxu24a0MuaPsnqwpaKPcDobJl2_2G4U0k6UwP139edn01u9o2BmejAYisxjTrABB_Ai9IEKCQLVsAkKGpcQ","e":"AQAB","alg":"RSA-OAEP-256","ext":true,"key_ops":["encrypt"]},
  // Freigabe, solange der Worker nichts anderes meldet (te = Terme-Insel LU 10, dd = Daten-Stadt LU 11)
  worlds: { te: true, dd: false },
  tokenHashes: [
    '86a452884a8b41a7f39d9bbaf022acc2e0378fcd681c6f863dee0fffcbacc4d4', // 1A01
    'cbcd0a7b0a6e4f36387751e20a7b1524039d09fab45c15c08bbe3eb7d621ee83', // 1A02
    '772bf08c84682fa7a0a4a3d389319d5a3dd0413b5c7172b0865be1cc8d1091cc', // 1A03
    'f720cb3765c4e8d68f7fe7218cde83e06e49dcaec34459e766ef2bcdff5ee01a', // 1A04
    'd3049738b8c4d81151f9b676c68a88e7fb03cf3e6e889811671a16653db53da6', // 1A05
    'a411e6abcd4240d431994bea3083174db009cb32e80a00a2c2c7fa5b5a63a55f', // 1A06
    'e2b473d5c3408f813f382ccc3278833ef0272ec4dd391fa33fd2e520dd809c97', // 1A07
    '1bd424d0de4c3027c59f63668553242305f394c99fbcda79aaea92e56321d9d5', // 1A08
    'd288f80060459a67b7df860dea94e004d9a03033c864a636e36cd2c04a79ae5c', // 1A09
    '971840a0015517e207dc2bcc39fbe1435b8617ceeeed2520303d78f052221a13', // 1A10
    '365f8627ec40e49a77e1ae16f6e50fd32ac45e1f379ddea69ef8b5b5cd94609f', // 1A11
    '46faee57d31577561e628f5e093e184fcaafb17a03f371d3939385085f079fba', // 1A12
    'd2e0547598c95cb9c0b7f922cf530b61316e6dc3efd518f8eae66b7d189ec860', // 1A13
    'cc74a07d37539c2baad154fd7bec82cc712620bacb4e187151ddef70edf119e7', // 1A14
    'edcb508fc0a461c9c5fda41faeceb16d1713c3f474ff1b9e3922da9df97a16dc', // 1A15
    '42d1b4f69ef24494006ef254a19097912ebf916760ac1f2e14ad67f28405c731', // 1A16
    '5b4380c189f143f96940d6514fbe314fdb6e7c1c5442d645a073b4c030beb957', // 1A99 (Test Lehrperson)
  ]
};
