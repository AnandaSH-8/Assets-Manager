import { motion } from "framer-motion"
import { IndianRupee } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

export default function Footer() {
  const LinkedInIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )

  const XIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )

  const GitHubIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )

  const socialLinks = [
    {
      name: "LinkedIn",
      icon: LinkedInIcon,
      url: "https://www.linkedin.com/in/ananda-s-holla-268b94147/",
      color: "hover:text-blue-600 dark:hover:text-blue-400"
    },
    {
      name: "X (Twitter)",
      icon: XIcon,
      url: "https://x.com/AnandSHolla8",
      color: "hover:text-gray-900 dark:hover:text-gray-100"
    },
    {
      name: "GitHub",
      icon: GitHubIcon,
      url: "https://github.com/AnandaSH-8",
      color: "hover:text-gray-800 dark:hover:text-gray-200"
    }
  ]

  return (
    <footer className="mt-auto border-t border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <GlassCard className="p-6">
          <div className="flex flex-col items-center space-y-6">
            {/* Logo and Brand */}
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary text-white shadow-lg">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  AssetsManager
                </h3>
                <p className="text-xs text-muted-foreground">
                  Track. Manage. Grow.
                </p>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div 
              className="flex items-center gap-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-xl bg-accent/20 border border-border/50 transition-all duration-300 ${link.color} hover:scale-110 hover:shadow-lg`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <link.icon />
                  <span className="sr-only">{link.name}</span>
                </motion.a>
              ))}
            </motion.div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Made by ASH */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="text-sm text-muted-foreground">
                Made with ❤️ by{" "}
                <span className="font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  ASH
                </span>
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                © {new Date().getFullYear()} AssetsManager. All rights reserved.
              </p>
            </motion.div>
          </div>
        </GlassCard>
      </div>
    </footer>
  )
}