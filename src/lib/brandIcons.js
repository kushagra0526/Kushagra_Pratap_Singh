import {
  siApachekafka,
  siApollographql,
  siClaude,
  siCss,
  siDocker,
  siExpress,
  siGeeksforgeeks,
  siGit,
  siGithub,
  siGithubactions,
  siGooglegemini,
  siGraphql,
  siHtml5,
  siJavascript,
  siJsonwebtokens,
  siLeetcode,
  siMongodb,
  siNodedotjs,
  siPostgresql,
  siPrisma,
  siPython,
  siReact,
  siRedis,
  siSocketdotio,
} from "simple-icons";

// LinkedIn, AWS Lambda and DynamoDB aren't here, all three were withdrawn
// from simple-icons at the brands' request, so they fall back to a lettermark.
export const ICONS = {
  apollo: siApollographql,
  claude: siClaude,
  css: siCss,
  docker: siDocker,
  express: siExpress,
  geeksforgeeks: siGeeksforgeeks,
  gemini: siGooglegemini,
  git: siGit,
  github: siGithub,
  githubactions: siGithubactions,
  graphql: siGraphql,
  html: siHtml5,
  javascript: siJavascript,
  jwt: siJsonwebtokens,
  kafka: siApachekafka,
  leetcode: siLeetcode,
  mongodb: siMongodb,
  node: siNodedotjs,
  postgresql: siPostgresql,
  prisma: siPrisma,
  python: siPython,
  react: siReact,
  redis: siRedis,
  socketio: siSocketdotio,
};

function relativeLuminance(hex) {
  const n = parseInt(hex, 16);
  const channel = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

/**
 * The brand colour for hover states, or null when that colour would vanish
 * against the navy (Express, Kafka and Prisma are near-black), in which case
 * the caller falls back to cream.
 */
export function brandColor(name) {
  const icon = ICONS[name];
  if (!icon) return null;
  return relativeLuminance(icon.hex) > 0.11 ? `#${icon.hex}` : null;
}
