import React from 'react'
import { motion } from 'framer-motion'


export default function Loader(){
return (
<div className="flex items-center justify-center h-[60vh]">
<motion.p
className="text-xl md:text-2xl font-medium text-gray-700"
animate={{ opacity: [0, 1, 0] }}
transition={{ duration: 3, repeat: Infinity }}
>
The only way to learn maths is to do maths
</motion.p>
</div>
)
}