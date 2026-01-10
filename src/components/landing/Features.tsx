import { motion } from 'framer-motion';
import { CreditCard, BrainCircuit, Bell, PieChart, Lock, Zap } from 'lucide-react';

const features = [
  {
    icon: CreditCard,
    title: 'Auto-Detect Subscriptions',
    description: 'Connect your bank and we automatically find all recurring payments using smart pattern matching.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Financial Insights',
    description: 'Get personalized recommendations to optimize spending and identify subscriptions worth canceling.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Never be surprised by a charge. Get alerts before payments and when trial periods end.',
  },
  {
    icon: PieChart,
    title: 'Spending Analytics',
    description: 'Visualize your recurring expenses with beautiful charts and track trends over time.',
  },
  {
    icon: Lock,
    title: 'Bank-Grade Security',
    description: 'Your data is encrypted with AES-256-GCM. We never store your banking credentials.',
  },
  {
    icon: Zap,
    title: 'Instant Sync',
    description: 'Real-time transaction syncing keeps your subscription list always up to date.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(173_80%_50%/0.03),transparent_70%)]" />
      
      <div className="container px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to
            <span className="gradient-text"> Save Money</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to give you complete control over your recurring expenses.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card-hover p-6 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
