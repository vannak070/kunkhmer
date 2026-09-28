/**
 * Which proxies may tell us the client's IP (X-Forwarded-For), so per-IP rate limits count real
 * visitors. Default: exactly one hop, and only when it's our own proxy on localhost or a private
 * network (the Vite dev proxy, nginx in Docker). request.ip is then the address that proxy appended,
 * so a client can't pick its own IP by sending X-Forwarded-For. TRUST_PROXY overrides this.
 */
import { BlockList } from "node:net";

const OWN_NETWORK = new BlockList();
OWN_NETWORK.addSubnet("127.0.0.0", 8, "ipv4");
OWN_NETWORK.addSubnet("10.0.0.0", 8, "ipv4");
OWN_NETWORK.addSubnet("172.16.0.0", 12, "ipv4");
OWN_NETWORK.addSubnet("192.168.0.0", 16, "ipv4");
OWN_NETWORK.addAddress("::1", "ipv6");
OWN_NETWORK.addSubnet("fc00::", 7, "ipv6");

export function trustOwnProxy(address: string, hop: number): boolean {
  return hop === 0 && OWN_NETWORK.check(address, address.includes(":") ? "ipv6" : "ipv4");
}
