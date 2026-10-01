import archives from '../archives.js';
import blockLists from '../block-lists.js';
import breaches from '../breaches.js';
import carbon from '../carbon.js';
import cookies from '../cookies.js';
import dnsServer from '../dns-server.js';
import dns from '../dns.js';
import dnssec from '../dnssec.js';
import firewall from '../firewall.js';
import getIp from '../get-ip.js';
import headers from '../headers.js';
import hsts from '../hsts.js';
import httpSecurity from '../http-security.js';
import linkedPages from '../linked-pages.js';
import location from '../location.js';
import mailConfig from '../mail-config.js';
import ports from '../ports.js';
import quality from '../quality.js';
import rank from '../rank.js';
import redirects from '../redirects.js';
import robotsTxt from '../robots-txt.js';
import screenshot from '../screenshot.js';
import securityTxt from '../security-txt.js';
import shodan from '../shodan.js';
import sitemap from '../sitemap.js';
import socialPresence from '../social-presence.js';
import socialTags from '../social-tags.js';
import ssl from '../ssl.js';
import status from '../status.js';
import subdomains from '../subdomains.js';
import techStack from '../tech-stack.js';
import threats from '../threats.js';
import tlsConnection from '../tls-connection.js';
import tlsLabs from '../tls-labs.js';
import traceRoute from '../trace-route.js';
import txtRecords from '../txt-records.js';
import whois from '../whois.js';

// The check handlers remain independent modules. This registry only lets constrained deployment
// platforms expose them through one catch-all function instead of one function per check.
const handlers = {
  archives,
  'block-lists': blockLists,
  breaches,
  carbon,
  cookies,
  'dns-server': dnsServer,
  dns,
  dnssec,
  firewall,
  'get-ip': getIp,
  headers,
  hsts,
  'http-security': httpSecurity,
  'linked-pages': linkedPages,
  location,
  'mail-config': mailConfig,
  ports,
  quality,
  rank,
  redirects,
  'robots-txt': robotsTxt,
  screenshot,
  'security-txt': securityTxt,
  shodan,
  sitemap,
  'social-presence': socialPresence,
  'social-tags': socialTags,
  ssl,
  status,
  subdomains,
  'tech-stack': techStack,
  threats,
  'tls-connection': tlsConnection,
  'tls-labs': tlsLabs,
  'trace-route': traceRoute,
  'txt-records': txtRecords,
  whois,
};

export default handlers;
