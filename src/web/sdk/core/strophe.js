import strophe, { Strophe } from 'strophe.js';
import 'strophejs-plugin-disco';
import 'strophejs-plugin-ping';
import 'strophejs-plugin-vcard';
// ie <= 8 使用
// import '../common/lib/strophejs-plugin-iexdomain';

// Strophe.js => export default =>
// root.Strophe        = wrapper.Strophe;
// root.$build         = wrapper.$build;
// root.$iq            = wrapper.$iq;
// root.$msg           = wrapper.$msg;
// root.$pres          = wrapper.$pres;
// root.SHA1           = wrapper.SHA1;
// root.MD5            = wrapper.MD5;
// root.b64_hmac_sha1  = wrapper.b64_hmac_sha1;
// root.b64_sha1       = wrapper.b64_sha1;
// root.str_hmac_sha1  = wrapper.str_hmac_sha1;
// root.str_sha1       = wrapper.str_sha1;

// const { Strophe } = strophe;

Strophe.addNamespace('CHATSTATES', 'http://jabber.org/protocol/chatstates');
Strophe.addNamespace('REGISTER', 'jabber:iq:register');
Strophe.addNamespace('ROSTERX', 'http://jabber.org/protocol/rosterx');
Strophe.addNamespace('XFORM', 'jabber:x:data');
Strophe.addNamespace('CSI', 'urn:xmpp:csi:0');

const { $msg, $iq, MD5, $pres } = strophe

export { Strophe, $msg, $iq, MD5, $pres };
export default strophe;
