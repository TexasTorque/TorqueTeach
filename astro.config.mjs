// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from '@astrojs/react';
import starlightVideos from 'starlight-videos'


// https://astro.build/config
export default defineConfig({
  site: "https://teach.texastorque.org",
  output: "static",
  integrations: [
    starlight({
      plugins: [starlightVideos()],

      title: "Torque Teach",
      components: {
        Header: "./src/components/header.astro"
      },
      customCss: [
        // Path to your custom CSS file
        './src/styles/custom.css',
      ],
      editLink: {
        baseUrl:
          "https://github.com/TexasTorque/TorqueTeach/edit/master/src/content/docs/",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/TexasTorque",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          collapsed: true,
          items: [{ label: "Introduction", slug: "introduction" }],
        },
        {
          label: "Subteams",
          collapsed: true,
          items: [  
            { label: "Programming", items: [
              {autogenerate: {directory: "subteams/programming", collapsed: true}}
            ] },
            { label: "Electrical", items: [
              {autogenerate: {directory: "subteams/electrical", collapsed: true }}
            ] },
            {
              label: "Mechanical",
              collapsed: true,
              items: [
                { label: "Design", items:[
                  {autogenerate: {directory: "subteams/mechanical/design", collapsed: true }}
                ] },
                {
                  label: "Fabrication",
                  collapsed: true,
                  items: [
                    {autogenerate: {directory: "subteams/mechanical/fabrication", collapsed: true }},
                  ],
                },
                { label: "Assembly", items: [
                  {autogenerate: {directory: "subteams/mechanical/assembly", collapsed: true }}
                ] },
              ],
            },
            {
              label: "Business",
              collapsed: true,
              items: [
                { label: "Media", items: [
                  {autogenerate: {directory: "subteams/business/media" }}
                ] },
                { label: "Awards", items: [
                  {autogenerate: {directory: "subteams/business/awards" }}
                ] },
                { label: "Outreach", items: [
                  {autogenerate: {directory: "subteams/business/outreach" }}
                ] },
              ],
            },
          ],
        },
        {
          label: "Strategy",
          collapsed: true,
          items: [
            { label: "Scouting", items: [
              {autogenerate: {directory: "strategy/scouting" }}
            ] },
            { label: "Analysis", items: [
              {autogenerate: {directory: "strategy/analysis" }}
            ] },
          ],
        },
        {
          label: "Profile",
          collapsed: true,
          items: [{ label: "Account", slug: "profile" }]
        },
      ],
    }),
    react()
  ],
  
  vite: {
      resolve: {
        dedupe: ["react", "react-dom", "react-dom/server"],
      },
    }
});
