'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  MapPin, 
  Clock, 
  ExternalLink,
  Star,
  CheckCircle,
  MessageCircle,
  Mail,
  Briefcase,
  Upload,
  X,
  Send
} from 'lucide-react';

export default function WorkWithUs() {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    position: 'Social Media & Sales Coordinator',
    experience: '',
    motivation: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const europeanCountries = [
    'United Kingdom', 'United States', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland', 'Germany', 'France', 'Italy', 'Spain', 'Portugal',
    'Netherlands', 'Belgium', 'Luxembourg', 'Austria', 'Switzerland', 'Poland', 'Czech Republic', 'Slovakia',
    'Hungary', 'Slovenia', 'Croatia', 'Romania', 'Bulgaria', 'Greece', 'Cyprus', 'Malta', 'Estonia', 'Latvia',
    'Lithuania', 'Ireland'
  ];

  const filteredCountries = europeanCountries.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'text/csv'];
      return validTypes.includes(file.type);
    });
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCountrySelect = (country: string) => {
    setFormData(prev => ({ ...prev, country }));
    setSearchTerm(country);
    setShowCountryDropdown(false);
  };

  const handleCountrySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowCountryDropdown(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('motivation', formData.motivation);
      
      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      const response = await fetch('/api/submit-application', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage('Application submitted successfully! We\'ll get back to you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          country: '',
          position: 'Social Media & Sales Coordinator',
          experience: '',
          motivation: ''
        });
        setFiles([]);
        setShowApplicationForm(false);
      } else {
        setSubmitMessage('Error submitting application. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const jobListings = [
    {
      id: 1,
      title: "Social Media & Sales Coordinator",
      location: "Remote",
      type: "Full-time",
      salary: "Competitive + Commission",
      description: "Help us grow our community, build strong partnerships, and keep our website running smoothly. Join our fast-growing platform helping users find the best deals and information on nicotine pouches.",
      responsibilities: [
        "Create and share engaging content on our social media channels (Instagram, TikTok, Facebook, etc.)",
        "Reach out to brands and partners, negotiate deals, and help us expand our network",
        "Review our website regularly — make sure it's functional, accurate, and user-friendly"
      ],
      requirements: [
        "Experience with social media management",
        "Strong communication and negotiation skills",
        "Detail-oriented with a 'fix it before it breaks' mindset",
        "Self-driven, proactive, and eager to grow with us"
      ],
      benefits: [
        "Flexible remote work (with team check-ins)",
        "A chance to shape and grow an exciting international platform",
        "Commission opportunities on successful deals",
        "A supportive, small team where your ideas matter"
      ],
      posted: "4 days ago",
      urgent: true,
      contact: "info@solvify.se"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Work at Nicotine Pouches
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Join our fast-growing platform and help us build the best nicotine pouch community. We're looking for passionate individuals who want to make a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                <Briefcase className="w-5 h-5 mr-2" />
                View Open Positions
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-purple-600">
                <Mail className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Open Positions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're always looking for talented individuals to join our team. Check out our current openings and see if there's a perfect fit for you.
          </p>
        </div>

        <div className="space-y-6">
          {jobListings.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                      {job.urgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {job.type}
                      </div>
                      <div className="font-semibold text-green-600">
                        {job.salary}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">What You'll Do:</h4>
                      <ul className="space-y-1">
                        {job.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">What We're Looking For:</h4>
                      <ul className="space-y-1">
                        {job.requirements.map((req, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">What We Offer:</h4>
                      <ul className="space-y-1">
                        {job.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Posted {job.posted}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 lg:min-w-[200px]">
                    <Button 
                      className="w-full" 
                      onClick={() => setShowApplicationForm(true)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`mailto:${job.contact}?subject=Question about ${job.title}`}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ask Questions
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Why Work With Us Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Work With Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building something special, and we want you to be part of it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Small Team, Big Impact</h3>
              <p className="text-gray-600">Work directly with founders and make decisions that shape our platform's future.</p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Remote</h3>
              <p className="text-gray-600">Work from anywhere in the world with flexible hours and team check-ins.</p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth Opportunities</h3>
              <p className="text-gray-600">Commission-based rewards and opportunities to grow with our expanding platform.</p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join Our Team?
          </h2>
          <p className="text-xl mb-8">
            Don't see a position that fits? We're always interested in hearing from talented people.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              <Mail className="w-5 h-5 mr-2" />
              Send Us Your CV
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-purple-600">
              <MessageCircle className="w-5 h-5 mr-2" />
              Get in Touch
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Our Culture</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Remote-first approach</li>
                <li>Flexible working hours</li>
                <li>Open communication</li>
                <li>Continuous learning</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Benefits</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Competitive compensation</li>
                <li>Commission opportunities</li>
                <li>Professional development</li>
                <li>Work-life balance</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-300">
                <li>info@solvify.se</li>
                <li>London, UK</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Apply for Position</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApplicationForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+44 20 1234 5678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <div className="relative" ref={dropdownRef}>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={searchTerm}
                        onChange={handleCountrySearch}
                        onFocus={() => setShowCountryDropdown(true)}
                        placeholder="Search for your country..."
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {showCountryDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                              <button
                                key={country}
                                type="button"
                                onClick={() => handleCountrySelect(country)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              >
                                {country}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-gray-500">No countries found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about your relevant experience..."
                  />
                </div>

                <div>
                  <Label htmlFor="motivation">Why do you want to work with us? *</Label>
                  <textarea
                    id="motivation"
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us why you're interested in this position and what you can bring to our team..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="files">Attach Files (PDF, JPG, PNG, CSV)</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      id="files"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('files')?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                    <p className="text-sm text-gray-500 mt-1">
                      Accepted formats: PDF, JPG, PNG, CSV (Max 10MB per file)
                    </p>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium">Selected Files:</h4>
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {submitMessage && (
                  <div className={`p-4 rounded-md ${
                    submitMessage.includes('successfully') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {submitMessage}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowApplicationForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
