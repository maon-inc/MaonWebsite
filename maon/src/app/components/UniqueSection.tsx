interface FeatureCardProps {
  title: string;
  width?: string;
  maxWidth?: string;
}

function FeatureCard({ title, width = "w-[342px]", maxWidth = "max-w-[230px]" }: FeatureCardProps) {
  return (
    <div className={`bg-[#f5efe8] border-[2.73px] border-[#5d5d5d] rounded-[36.4px] flex flex-col justify-end ${width} h-[399px] p-12`}>
      <h4 className={`font-geist-sans font-medium text-2xl leading-8 text-black tracking-tight ${maxWidth}`}>
        {title}
      </h4>
    </div>
  );
}

export default function UniqueSection() {
  return (
    <section className="bg-[#f5efe8] mt-44 py-8 px-24 min-h-[729px]">
      <h3 className="libre-bodoni-medium text-3xl leading-[55px] text-[#484848] mb-28 tracking-tight">
        What makes us unique
      </h3>
      
      <div className="flex justify-center gap-11">
        <FeatureCard 
          title="Passive influence
on your emotion." 
        />
        <FeatureCard 
          title="Talk with your
own body." 
        />
        <FeatureCard 
          title="Personalized
experience that
gets better." 
          width="w-[375px]"
          maxWidth="max-w-[261px]"
        />
      </div>
    </section>
  );
}