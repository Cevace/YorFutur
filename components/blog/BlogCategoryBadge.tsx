type BlogCategoryBadgeProps = {
    category: string;
};

export default function BlogCategoryBadge({ category }: BlogCategoryBadgeProps) {
    return (
        <span className="inline-block text-xs font-medium text-cevace-blue 
            bg-cevace-blue/10 px-3 py-1 rounded-full">
            {category}
        </span>
    );
}
