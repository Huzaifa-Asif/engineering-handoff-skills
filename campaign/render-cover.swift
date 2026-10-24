// Original vector-style cover, drawn with macOS AppKit. MIT licensed.
// swift -module-cache-path /tmp/handoff-swift-cache campaign/render-cover.swift campaign/cover.png
import AppKit

let width = 1672, height = 941
let H = CGFloat(height)
let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height,
  bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
  colorSpaceName: .deviceRGB, bytesPerRow: width * 4, bitsPerPixel: 32)!
let context = NSGraphicsContext(bitmapImageRep: bitmap)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
context.imageInterpolation = .high
func color(_ hex: UInt32, _ alpha: CGFloat = 1) -> NSColor {
  NSColor(srgbRed: CGFloat((hex >> 16) & 255) / 255, green: CGFloat((hex >> 8) & 255) / 255,
    blue: CGFloat(hex & 255) / 255, alpha: alpha)
}
let cyan = color(0x57D9FF), gold = color(0xFFD44F), white = color(0xF5F8FF), muted = color(0xA5B8D0)
func rect(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat) -> NSRect {
  NSRect(x: x, y: H-y-h, width: w, height: h)
}
func text(_ value: String, _ x: CGFloat, _ y: CGFloat, _ size: CGFloat,
          _ tint: NSColor, _ weight: NSFont.Weight = .regular, mono: Bool = false) {
  let font = mono ? NSFont.monospacedSystemFont(ofSize: size, weight: weight) : NSFont.systemFont(ofSize: size, weight: weight)
  let attrs: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: tint]
  let string = value as NSString
  let measured = string.size(withAttributes: attrs)
  precondition(x + measured.width <= CGFloat(width) - 64, "Text exceeds right safe area")
  string.draw(at: NSPoint(x: x, y: H-y-measured.height), withAttributes: attrs)
}
func line(_ x1: CGFloat, _ y1: CGFloat, _ x2: CGFloat, _ y2: CGFloat, _ tint: NSColor, _ thickness: CGFloat) {
  let p = NSBezierPath(); p.move(to: NSPoint(x: x1, y: H-y1)); p.line(to: NSPoint(x: x2, y: H-y2))
  p.lineWidth = thickness; p.lineCapStyle = .round; tint.setStroke(); p.stroke()
}
func panel(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat, _ tint: NSColor) {
  NSGraphicsContext.saveGraphicsState()
  let shadow = NSShadow(); shadow.shadowColor = tint.withAlphaComponent(0.28); shadow.shadowBlurRadius = 30
  shadow.shadowOffset = .zero; shadow.set()
  let p = NSBezierPath(roundedRect: rect(x,y,w,h), xRadius: 22, yRadius: 22)
  NSGradient(starting: color(0x142237), ending: color(0x080E18))!.draw(in: p, angle: -90)
  tint.withAlphaComponent(0.9).setStroke(); p.lineWidth = 2; p.stroke()
  NSGraphicsContext.restoreGraphicsState()
  line(x+1,y+62,x+w-1,y+62,color(0x30435F),1)
  for (i, c) in [color(0xFF815D), gold, color(0x4FE0B5)].enumerated() {
    c.setFill(); NSBezierPath(ovalIn: rect(x+22+CGFloat(i)*22,y+23,10,10)).fill()
  }
}
func pill(_ value: String, _ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ tint: NSColor) {
  tint.withAlphaComponent(0.13).setFill()
  NSBezierPath(roundedRect: rect(x,y,w,40), xRadius: 9, yRadius: 9).fill()
  text(value,x+14,y+8,19,tint,.semibold,mono:true)
}
func arrow(_ x1: CGFloat, _ y1: CGFloat, _ x2: CGFloat, _ y2: CGFloat) {
  NSGraphicsContext.saveGraphicsState()
  let shadow = NSShadow(); shadow.shadowColor = gold.withAlphaComponent(0.65); shadow.shadowBlurRadius = 15; shadow.set()
  line(x1,y1,x2,y2,gold,5)
  line(x2-14,y2-13,x2,y2,gold,5); line(x2-14,y2+13,x2,y2,gold,5)
  NSGraphicsContext.restoreGraphicsState()
}

NSGradient(starting: color(0x020407), ending: color(0x0A101B))!.draw(in: rect(0,0,1672,941), angle: -65)
// Subtle gold ambience and layered dark waves echo the verified reference series.
for i in stride(from: 480, through: 20, by: -8) {
  let size = CGFloat(i)
  color(0xE6B126,0.004).setFill()
  NSBezierPath(ovalIn: rect(-size/2,-size/2,size*1.8,size*1.8)).fill()
}
for i in 0..<6 {
  let p = NSBezierPath(); let y = CGFloat(600+i*58)
  p.move(to:NSPoint(x:0,y:H-y))
  p.curve(to:NSPoint(x:1672,y:H-y-12), controlPoint1:NSPoint(x:500,y:H-y+120), controlPoint2:NSPoint(x:1060,y:H-y-140))
  p.line(to:NSPoint(x:1672,y:0)); p.line(to:NSPoint(x:0,y:0)); p.close()
  color(i % 2 == 0 ? 0x10151C : 0x05090F,0.55).setFill(); p.fill()
}
text("ENGINEERING SKILLS  •  REQUIRED CHECKS",96,70,30,gold,.semibold)

panel(112,211,400,182,cyan)
text("UNIT TESTS",140,289,25,white,.bold)
pill("source • sha256 7fe5…",140,332,340,cyan)
panel(112,419,400,182,cyan)
text("SYNTAX",140,497,25,white,.bold)
pill("source • sha256 7fe5…",140,540,340,cyan)

arrow(530,410,594,410)
panel(612,263,448,300,gold)
text("REQUIRE BOTH",640,345,26,white,.bold)
text("Selected source + check IDs",640,391,23,muted)
pill("Keep original records",640,448,387,gold)

arrow(1078,410,1142,410)
panel(1160,224,400,374,cyan)
text("SET REVIEW",1188,307,26,white,.bold)
let labels = ["Missing coverage?", "Conflicting bytes?", "Local consistency only"]
for (i,label) in labels.enumerated() {
  let y = CGFloat(368+i*61)
  let tint = i == 2 ? gold : cyan
  tint.setFill(); NSBezierPath(ovalIn:rect(1190,y+6,10,10)).fill()
  text(label,1216,y,22,i == 2 ? gold : white,.medium)
}
line(1189,547,1526,547,color(0x30435F),1)

text("Are all required checks here?",96,717,72,white,.bold)
text("Review separate records. Preserve unfinished work.",100,816,31,gold,.medium)
NSGraphicsContext.restoreGraphicsState()
let output = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "campaign/cover.png"
try bitmap.representation(using: .png, properties: [:])!.write(to:URL(fileURLWithPath:output))
print("Exported 1672x941 PNG to \(output)")
