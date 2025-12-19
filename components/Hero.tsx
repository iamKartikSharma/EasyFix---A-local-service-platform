import Link from "next/link";
import { ArrowRight, CheckCircle, Star } from "lucide-react";

export default function Hero() {
    return (
        <div className="relative bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                    <svg
                        className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
                        fill="currentColor"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <polygon points="50,0 100,0 50,100 0,100" />
                    </svg>

                    <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                        <div className="sm:text-center lg:text-left">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                                <Star className="h-4 w-4 mr-2 fill-primary" />
                                #1 Trusted Local Services
                            </div>
                            <h1 className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl">
                                <span className="block xl:inline">Find and book trusted</span>{" "}
                                <span className="block text-primary xl:inline">
                                    local experts
                                </span>
                            </h1>
                            <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                Need a plumber, electrician, or carpenter? We connect you with
                                verified professionals in your area. Fast, reliable, and
                                affordable services at your doorstep.
                            </p>
                            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                                <div className="rounded-md shadow">
                                    <Link
                                        href="/book"
                                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-teal-800 md:py-4 md:text-lg md:px-10 transition-all hover:shadow-lg"
                                    >
                                        Book a Service
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </div>
                                <div className="mt-3 sm:mt-0 sm:ml-3">
                                    <Link
                                        href="/services"
                                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 md:py-4 md:text-lg md:px-10 transition-all"
                                    >
                                        View Services
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-border pt-6">
                                <p className="text-sm text-muted-foreground mb-3">Trusted by 10,000+ homeowners</p>
                                <div className="flex flex-wrap gap-4 text-sm font-medium text-foreground">
                                    <div className="flex items-center">
                                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                                        Verified Pros
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                                        Insured Work
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                                        Satisfaction Guarantee
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-muted">
                {/* Placeholder for Hero Image */}
                <div className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full bg-gradient-to-br from-teal-100 to-amber-50 flex items-center justify-center text-muted-foreground">
                    <div className="text-center p-8">
                        <div className="text-6xl mb-4">🛠️</div>
                        <p className="text-lg font-medium">Professional Services</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
