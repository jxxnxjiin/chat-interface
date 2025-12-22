"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { toolCategories } from "@/lib/data/ai-tools"

export function AIToolsView() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        업무 유형에 맞는 최적의 AI 도구를 찾아보세요.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toolCategories.map((category) => (
          <motion.div
            key={category.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/50 rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{category.icon}</span>
              <h3 className="text-lg font-semibold">{category.type}</h3>
            </div>

            <div className="space-y-3">
              {category.tools.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-muted transition-colors group"
                >
                  <div>
                    <p className="font-medium text-sm">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

