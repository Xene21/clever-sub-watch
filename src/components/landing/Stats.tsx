import { motion } from 'framer-motion';

const stats = [
  { value: '$847', label: 'Average yearly savings', suffix: '' },
  { value: '12', label: 'Subscriptions per user', suffix: '+' },
  { value: '99.9', label: 'Uptime guarantee', suffix: '%' },
  { value: '50K', label: 'Happy users', suffix: '+' },
];

const Stats = () => {
  return (
    <section className="py-20 border-y border-border/50">
      <div className="container px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl md:text-5xl font-bold gradient-text mb-2">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
