// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from '@astrojs/react';
import node from '@astrojs/node';
import starlightVideos from 'starlight-videos'


// https://astro.build/config
export default defineConfig({
  site: "https://teach.texastorque.org",
  output: "static",

  adapter: node({
    mode: "standalone"
  }),

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
          items: [{ label: "Introduction", slug: "introduction" }],
        },
        {
          label: "Subteams",
          items: [  
            { label: "Programming", items: [
              {autogenerate: {directory: "subteams/programming" }}
            ] },
            { label: "Electrical", items: [
              {autogenerate: {directory: "subteams/electrical" }}
            ] },
            {
              label: "Mechanical",
              items: [
                { label: "Design", items:[
                  {autogenerate: {directory: "subteams/mechanical/design" }}
                ] },
                {
                  label: "Fabrication",
                  items: [
                    {autogenerate: {directory: "subteams/mechanical/fabrication" }},
                  ],
                },
                { label: "Assembly", items: [
                  {autogenerate: {directory: "subteams/mechanical/assembly" }}
                ] },
              ],
            },
            {
              label: "Business",
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
