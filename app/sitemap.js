const siteUrl = "https://client-portal.buttnetworks.com";

export default function sitemap() {
  const routes = [
    "",
    "/portal",
    "/portal/projects",
    "/portal/notification",
    "/portal/settings",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changefreq: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
