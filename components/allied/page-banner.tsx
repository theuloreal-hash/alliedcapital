import Link from "next/link"

export function PageBanner({
  title,
  image,
  imageAlt,
}: {
  title: string
  image: string
  imageAlt: string
}) {
  return (
    <section className="border-b border-[#dcdcdc] bg-[#f5f5f5]">
      <div className="allied-container flex flex-col gap-2 py-3 md:h-[74px] md:flex-row md:items-center md:gap-6 md:py-0">
        <h1 className="text-[15px] font-normal text-[#333333] md:w-[190px] md:shrink-0">{title}</h1>

        <div className="hidden h-[50px] min-w-0 flex-1 overflow-hidden md:block">
          <img src={image} alt={imageAlt} className="h-full w-full object-cover" />
        </div>

        <div className="text-[10px] text-[#777777] md:ml-auto md:shrink-0">
          You are here:{" "}
          <Link href="/" className="underline-offset-2 hover:text-[#F4A128] hover:underline">
            Home
          </Link>{" "}
          /{" "}
          <span aria-current="page" className="text-[#555555]">
            {title}
          </span>
        </div>
      </div>
    </section>
  )
}
