// Apple Vision helper for the Paris reels: subject cut-out masks + face landmarks, no third-party models.
//   swift lib/vision.swift <outDir> <image> [<image> …]
// For each image writes <outDir>/<stem>.mask.png (8-bit grey, image size, white = subject; foreground-instance
// mask, all instances) and <outDir>/<stem>.face.json ({w,h,faces:[{box,leftEye,rightEye,nose}]}) in image pixels
// with a top-left origin. "left"/"right" are image-left / image-right (not the subject's).
import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count >= 3 else { print("usage: vision.swift <outDir> <image>…"); exit(2) }
let outDir = URL(fileURLWithPath: args[1])
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
let ctx = CIContext()

func centroid(_ r: VNFaceLandmarkRegion2D?, _ box: CGRect, _ w: CGFloat, _ h: CGFloat) -> [Double]? {
  guard let r = r, r.pointCount > 0 else { return nil }
  let pts = r.pointsInImage(imageSize: CGSize(width: w, height: h))
  let x = pts.map { $0.x }.reduce(0, +) / CGFloat(pts.count)
  let y = pts.map { $0.y }.reduce(0, +) / CGFloat(pts.count)
  return [Double(x), Double(h - y)]
}

for path in args.dropFirst(2) {
  let url = URL(fileURLWithPath: path)
  let stem = url.deletingPathExtension().lastPathComponent
  guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
        let cg = CGImageSourceCreateImageAtIndex(src, 0, nil) else { print("skip \(path)"); continue }
  let w = CGFloat(cg.width), h = CGFloat(cg.height)
  let handler = VNImageRequestHandler(cgImage: cg, options: [:])

  // faces
  let faceReq = VNDetectFaceLandmarksRequest()
  try? handler.perform([faceReq])
  var faces: [[String: Any]] = []
  for f in faceReq.results ?? [] {
    let b = f.boundingBox
    let box = [Double(b.minX * w), Double((1 - b.maxY) * h), Double(b.width * w), Double(b.height * h)]
    var d: [String: Any] = ["box": box, "confidence": Double(f.confidence)]
    if let lm = f.landmarks {
      // pupils are the most stable eye anchor; fall back to eye-contour centroids
      let le = centroid(lm.leftPupil, b, w, h) ?? centroid(lm.leftEye, b, w, h)
      let re = centroid(lm.rightPupil, b, w, h) ?? centroid(lm.rightEye, b, w, h)
      if let le = le, let re = re {
        // Vision's "left" is the subject's left = image right; normalise to image-left / image-right
        d["leftEye"] = le[0] < re[0] ? le : re
        d["rightEye"] = le[0] < re[0] ? re : le
      }
      if let n = centroid(lm.nose, b, w, h) { d["nose"] = n }
    }
    faces.append(d)
  }
  let json = try JSONSerialization.data(withJSONObject: ["w": Double(w), "h": Double(h), "faces": faces], options: [.prettyPrinted, .sortedKeys])
  try json.write(to: outDir.appendingPathComponent("\(stem).face.json"))

  // subject mask
  let maskReq = VNGenerateForegroundInstanceMaskRequest()
  do {
    try handler.perform([maskReq])
    if let obs = maskReq.results?.first {
      let buf = try obs.generateScaledMaskForImage(forInstances: obs.allInstances, from: handler)
      let ci = CIImage(cvPixelBuffer: buf)
      let grey = CGColorSpaceCreateDeviceGray()
      if let out = ctx.createCGImage(ci, from: ci.extent, format: .L8, colorSpace: grey) {
        let dst = outDir.appendingPathComponent("\(stem).mask.png")
        if let d = CGImageDestinationCreateWithURL(dst as CFURL, UTType.png.identifier as CFString, 1, nil) {
          CGImageDestinationAddImage(d, out, nil); CGImageDestinationFinalize(d)
        }
      }
    } else { print("no subject: \(stem)") }
  } catch { print("mask failed \(stem): \(error)") }
  print("\(stem): faces=\(faces.count)")
}
