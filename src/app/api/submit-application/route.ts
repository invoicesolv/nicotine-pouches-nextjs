import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const country = formData.get('country') as string;
    const position = formData.get('position') as string;
    const experience = formData.get('experience') as string;
    const motivation = formData.get('motivation') as string;
    const files = formData.getAll('files') as File[];

    // Validate required fields
    if (!name || !email || !country || !position || !motivation) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate country - Allow all European countries plus US and UK
    const allowedCountries = [
      'United Kingdom', 'United States', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland', 'Germany', 'France', 'Italy', 'Spain', 'Portugal',
      'Netherlands', 'Belgium', 'Luxembourg', 'Austria', 'Switzerland', 'Poland', 'Czech Republic', 'Slovakia',
      'Hungary', 'Slovenia', 'Croatia', 'Romania', 'Bulgaria', 'Greece', 'Cyprus', 'Malta', 'Estonia', 'Latvia',
      'Lithuania', 'Ireland'
    ];
    if (!allowedCountries.includes(country)) {
      return NextResponse.json(
        { success: false, error: 'Only applicants from European countries, US, and UK are accepted' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    // Prepare attachments
    const attachments = [];
    for (const file of files) {
      if (file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        attachments.push({
          filename: file.name,
          content: buffer,
          contentType: file.type
        });
      }
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'kevin@solvify.se',
      subject: `Job Application: ${position} - ${name}`,
      html: `
        <h2>New Job Application</h2>
        <p><strong>Position:</strong> ${position}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Country:</strong> ${country}</p>
        
        <h3>Experience</h3>
        <p>${experience || 'Not provided'}</p>
        
        <h3>Motivation</h3>
        <p>${motivation}</p>
        
        <p><em>This application was submitted through the Nicotine Pouches website.</em></p>
      `,
      attachments: attachments
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Application submitted successfully!' 
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
