'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland', 'Germany', 'France', 'Italy', 'Spain', 'Portugal',
    'Netherlands', 'Belgium', 'Luxembourg', 'Austria', 'Switzerland', 'Poland', 'Czech Republic', 'Slovakia',
    'Hungary', 'Slovenia', 'Croatia', 'Romania', 'Bulgaria', 'Greece', 'Cyprus', 'Malta', 'Estonia', 'Latvia',
    'Lithuania', 'Ireland'
  ];

  const filteredCountries = countries.filter(country =>
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
    <div id="boxed-wrapper">
      <div id="wrapper" className="fusion-wrapper">
        <Header />

        <main id="main" className="clearfix" style={{
          backgroundColor: '#ffffff',
          minHeight: '100vh',
          padding: '0',
          margin: '0',
          width: '100%'
        }}>

          {/* Hero Section */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '24px 20px 32px 20px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {/* Breadcrumb */}
            <nav style={{
              marginBottom: '20px',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              <Link href="/us" style={{
                color: '#1f2937',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '400'
              }}>Start</Link>
              <span style={{
                margin: '0 10px',
                color: '#9ca3af',
                fontSize: '15px'
              }}>/</span>
              <span style={{
                color: '#6b7280',
                fontSize: '15px'
              }}>Work With Us</span>
            </nav>

            {/* Title */}
            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#1f2937',
              margin: '0 0 16px 0',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              letterSpacing: '-0.5px',
              lineHeight: '1.1'
            }}>
              Work With Us
            </h1>

            {/* Description */}
            <p style={{
              fontSize: '17px',
              color: '#4b5563',
              maxWidth: '800px',
              margin: '0 0 32px 0',
              lineHeight: '1.7',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              Join our team and help build the leading nicotine pouch comparison platform.
              We're looking for passionate individuals who want to make a difference.
            </p>
          </div>

          {/* Open Positions Section */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '48px 20px'
          }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '24px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}>
                Open Positions
              </h2>

              {/* Job Listings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {jobListings.map((job) => (
                  <div
                    key={job.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '32px',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      {/* Job Header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h3 style={{
                              fontSize: '22px',
                              fontWeight: '700',
                              color: '#1f2937',
                              margin: 0
                            }}>
                              {job.title}
                            </h3>
                            {job.urgent && (
                              <span style={{
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                padding: '4px 12px',
                                borderRadius: '100px',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}>
                                Urgent
                              </span>
                            )}
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            color: '#6b7280',
                            fontSize: '14px'
                          }}>
                            <span>{job.location}</span>
                            <span>•</span>
                            <span>{job.type}</span>
                            <span>•</span>
                            <span style={{ color: '#059669', fontWeight: '600' }}>{job.salary}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            onClick={() => setShowApplicationForm(true)}
                            style={{
                              backgroundColor: '#1f2937',
                              color: '#ffffff',
                              padding: '12px 24px',
                              borderRadius: '8px',
                              fontSize: '15px',
                              fontWeight: '600',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Apply Now
                          </button>
                          <a
                            href={`mailto:${job.contact}?subject=Question about ${job.title}`}
                            style={{
                              backgroundColor: '#ffffff',
                              color: '#1f2937',
                              padding: '12px 24px',
                              borderRadius: '8px',
                              fontSize: '15px',
                              fontWeight: '600',
                              border: '1px solid #e5e7eb',
                              textDecoration: 'none',
                              display: 'inline-block'
                            }}
                          >
                            Ask Questions
                          </a>
                        </div>
                      </div>

                      {/* Job Description */}
                      <p style={{
                        color: '#4b5563',
                        fontSize: '15px',
                        lineHeight: '1.6',
                        margin: 0
                      }}>
                        {job.description}
                      </p>

                      {/* Job Details Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '24px',
                        marginTop: '8px'
                      }}>
                        {/* Responsibilities */}
                        <div>
                          <h4 style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            color: '#1f2937',
                            marginBottom: '12px'
                          }}>
                            What You'll Do
                          </h4>
                          <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            {job.responsibilities.map((item, index) => (
                              <li key={index} style={{
                                fontSize: '14px',
                                color: '#4b5563',
                                paddingLeft: '20px',
                                position: 'relative'
                              }}>
                                <span style={{
                                  position: 'absolute',
                                  left: 0,
                                  color: '#059669'
                                }}>•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Requirements */}
                        <div>
                          <h4 style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            color: '#1f2937',
                            marginBottom: '12px'
                          }}>
                            What We're Looking For
                          </h4>
                          <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            {job.requirements.map((item, index) => (
                              <li key={index} style={{
                                fontSize: '14px',
                                color: '#4b5563',
                                paddingLeft: '20px',
                                position: 'relative'
                              }}>
                                <span style={{
                                  position: 'absolute',
                                  left: 0,
                                  color: '#059669'
                                }}>•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Benefits */}
                        <div>
                          <h4 style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            color: '#1f2937',
                            marginBottom: '12px'
                          }}>
                            What We Offer
                          </h4>
                          <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            {job.benefits.map((item, index) => (
                              <li key={index} style={{
                                fontSize: '14px',
                                color: '#4b5563',
                                paddingLeft: '20px',
                                position: 'relative'
                              }}>
                                <span style={{
                                  position: 'absolute',
                                  left: 0,
                                  color: '#059669'
                                }}>•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Posted date */}
                      <div style={{
                        color: '#9ca3af',
                        fontSize: '13px',
                        marginTop: '8px'
                      }}>
                        Posted {job.posted}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Why Work With Us Section */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '64px 20px'
          }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '12px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                textAlign: 'center'
              }}>
                Why Work With Us?
              </h2>
              <p style={{
                fontSize: '17px',
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: '48px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}>
                We're building something special, and we want you to be part of it.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {/* Small Team Card */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '32px',
                  textAlign: 'center',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '12px'
                  }}>
                    Small Team, Big Impact
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    Work directly with founders and make decisions that shape our platform's future.
                  </p>
                </div>

                {/* Remote Card */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '32px',
                  textAlign: 'center',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '12px'
                  }}>
                    100% Remote
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    Work from anywhere in the world with flexible hours and team check-ins.
                  </p>
                </div>

                {/* Growth Card */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '32px',
                  textAlign: 'center',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '12px'
                  }}>
                    Growth Opportunities
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    Commission-based rewards and opportunities to grow with our expanding platform.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '48px 20px'
          }}>
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              textAlign: 'center',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                Don't see a position that fits?
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                We're always interested in hearing from talented people. Send us your CV and tell us how you can contribute.
              </p>
              <a
                href="mailto:info@solvify.se?subject=General Application"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#1f2937',
                  color: '#ffffff',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                Send Us Your CV
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            overflow: 'auto',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                Apply for Position
              </h2>
              <button
                onClick={() => setShowApplicationForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: '#6b7280'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Name & Email Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '6px'
                    }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Your full name"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '6px'
                    }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your.email@example.com"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Phone & Country Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '6px'
                    }}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 555 123 4567"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '6px'
                    }}>
                      Country *
                    </label>
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                      <input
                        type="text"
                        name="country"
                        value={searchTerm}
                        onChange={handleCountrySearch}
                        onFocus={() => setShowCountryDropdown(true)}
                        placeholder="Search for your country..."
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '15px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      {showCountryDropdown && (
                        <div style={{
                          position: 'absolute',
                          zIndex: 10,
                          width: '100%',
                          marginTop: '4px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                              <button
                                key={country}
                                type="button"
                                onClick={() => handleCountrySelect(country)}
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  textAlign: 'left',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '14px'
                                }}
                              >
                                {country}
                              </button>
                            ))
                          ) : (
                            <div style={{ padding: '10px 14px', color: '#9ca3af', fontSize: '14px' }}>
                              No countries found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '6px'
                  }}>
                    Position *
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    disabled
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px',
                      backgroundColor: '#f9fafb',
                      color: '#6b7280',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Experience */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '6px'
                  }}>
                    Experience
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Tell us about your relevant experience..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Motivation */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '6px'
                  }}>
                    Why do you want to work with us? *
                  </label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Tell us why you're interested in this position..."
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '6px'
                  }}>
                    Attach Files (PDF, JPG, PNG, CSV)
                  </label>
                  <input
                    type="file"
                    id="files"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.csv"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('files')?.click()}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#ffffff',
                      border: '1px dashed #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#6b7280',
                      fontSize: '14px'
                    }}
                  >
                    Click to upload files
                  </button>
                  <p style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginTop: '6px'
                  }}>
                    Accepted formats: PDF, JPG, PNG, CSV (Max 10MB per file)
                  </p>

                  {files.length > 0 && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {files.map((file, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#f9fafb',
                          padding: '8px 12px',
                          borderRadius: '6px'
                        }}>
                          <span style={{ fontSize: '14px', color: '#4b5563' }}>{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#9ca3af'
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Message */}
                {submitMessage && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: submitMessage.includes('successfully') ? '#f0fdf4' : '#fef2f2',
                    color: submitMessage.includes('successfully') ? '#166534' : '#dc2626',
                    fontSize: '14px'
                  }}>
                    {submitMessage}
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#ffffff',
                      color: '#1f2937',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#1f2937',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
